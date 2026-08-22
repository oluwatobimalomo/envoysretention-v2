import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { FeedbackEntry } from "../constants";

export type CallFeedbackRow = Database["public"]["Tables"]["call_feedback"]["Row"];

export const feedbackService = {
  async submitPublic(input: Database["public"]["Tables"]["feedback_submissions"]["Insert"]) {
    const supabase = await createClient();
    const { error } = await supabase.from("feedback_submissions").insert(input);
    if (error) throw new Error(error.message);
  },

  /** ResearchFeedback — merges first_timers.service_feedback with
   *  feedback_submissions, exactly like V1. */
  async listMerged({ search, dateFrom, dateTo }: { search?: string; dateFrom?: string; dateTo?: string } = {}): Promise<FeedbackEntry[]> {
    const supabase = await createClient();
    const [{ data: ftRows }, { data: subRows }] = await Promise.all([
      supabase.from("first_timers").select("id, full_name, service_feedback, service_date, gender, phone").order("service_date", { ascending: false }).limit(1000),
      supabase.from("feedback_submissions").select("*").order("submitted_at", { ascending: false }).limit(1000),
    ]);

    const merged: FeedbackEntry[] = [];
    for (const r of ftRows ?? []) {
      if (r.service_feedback?.trim()) {
        merged.push({
          id: `ft-${r.id}`, display_name: r.full_name || "Anonymous", gender: r.gender, phone: r.phone,
          feedback: r.service_feedback, date: r.service_date || "", source: "First-Timer Form",
        });
      }
    }
    for (const r of subRows ?? []) {
      if (r.feedback?.trim()) {
        merged.push({
          id: `sub-${r.id}`, display_name: r.name || "Anonymous", gender: r.gender, phone: r.phone,
          feedback: r.feedback, date: r.submitted_at?.slice(0, 10) || "", source: "Feedback Form",
        });
      }
    }

    return filterEntries(merged, { search, dateFrom, dateTo }).sort((a, b) => b.date.localeCompare(a.date));
  },

  /** GeneralFeedback — feedback_submissions only, not merged with first_timers. */
  async listGeneral({ search, dateFrom, dateTo }: { search?: string; dateFrom?: string; dateTo?: string } = {}): Promise<FeedbackEntry[]> {
    const supabase = await createClient();
    const { data: subRows } = await supabase.from("feedback_submissions").select("*").order("submitted_at", { ascending: false }).limit(1000);
    const entries: FeedbackEntry[] = (subRows ?? [])
      .filter((r) => r.feedback?.trim())
      .map((r) => ({
        id: r.id, display_name: r.name || "Anonymous", gender: r.gender, phone: r.phone,
        feedback: r.feedback, date: r.submitted_at?.slice(0, 10) || "", source: "Feedback Form" as const,
      }));
    return filterEntries(entries, { search, dateFrom, dateTo });
  },

  /** All Feedback — every call_feedback note logged during the Experience
   *  Team's 3-week pipeline, joined with the first-timer's name. */
  async listCallNotes({ search }: { search?: string } = {}) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("call_feedback")
      .select("*, first_timers(full_name, phone, gender)")
      .not("notes", "is", null)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    type Row = CallFeedbackRow & { first_timers: { full_name: string; phone: string; gender: string | null } | null };
    let rows = ((data ?? []) as unknown as Row[]).filter((r) => r.notes?.trim());
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.first_timers?.full_name?.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q));
    }
    return rows;
  },

  async listFlagged() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("call_feedback")
      .select("*, first_timers(full_name, phone, gender, membership_decision, service_date)")
      .eq("flagged_for_pastoral", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    type Row = CallFeedbackRow & { first_timers: { full_name: string; phone: string; gender: string | null; membership_decision: string | null; service_date: string } | null };
    const now = Date.now();
    return ((data ?? []) as unknown as Row[]).map((r) => ({ ...r, daysOpen: Math.floor((now - new Date(r.created_at).getTime()) / 86_400_000) }));
  },
};

function filterEntries(entries: FeedbackEntry[], { search, dateFrom, dateTo }: { search?: string; dateFrom?: string; dateTo?: string }): FeedbackEntry[] {
  return entries.filter((e) => {
    if (search) {
      const q = search.toLowerCase();
      if (!e.display_name.toLowerCase().includes(q) && !e.feedback.toLowerCase().includes(q)) return false;
    }
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    return true;
  });
}
