import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type FirstTimerRow = Database["public"]["Tables"]["first_timers"]["Row"];
export type CallFeedbackRow = Database["public"]["Tables"]["call_feedback"]["Row"];
export type CallAssignmentRow = Database["public"]["Tables"]["call_assignments"]["Row"];
export type PipelineOverviewRow = Database["public"]["Tables"]["pipeline_overviews"]["Row"];

export interface EnrichedFirstTimer extends FirstTimerRow {
  fbRows: CallFeedbackRow[];
  assignment: (CallAssignmentRow & { assignee_name: string | null }) | null;
  overview: PipelineOverviewRow | null;
}

export const callPipelineService = {
  async listEnriched({ dateFrom, dateTo }: { dateFrom?: string; dateTo?: string } = {}): Promise<EnrichedFirstTimer[]> {
    const supabase = await createClient();

    let ftQuery = supabase.from("first_timers").select("*").order("created_at", { ascending: false }).limit(500);
    if (dateFrom) ftQuery = ftQuery.gte("service_date", dateFrom);
    if (dateTo) ftQuery = ftQuery.lte("service_date", dateTo);

    const [{ data: ftRows, error: ftErr }, { data: fbRows }, { data: asgRows }, { data: ovRows }] = await Promise.all([
      ftQuery,
      supabase.from("call_feedback").select("*").order("created_at", { ascending: true }),
      supabase.from("call_assignments").select("*, profiles!call_assignments_assigned_to_fkey(full_name)"),
      supabase.from("pipeline_overviews").select("*"),
    ]);

    if (ftErr) throw new Error(ftErr.message);

    const fbMap = new Map<string, CallFeedbackRow[]>();
    for (const f of fbRows ?? []) {
      const list = fbMap.get(f.first_timer_id) ?? [];
      list.push(f);
      fbMap.set(f.first_timer_id, list);
    }
    const asgMap = new Map<string, CallAssignmentRow & { assignee_name: string | null }>();
    for (const a of (asgRows ?? []) as (CallAssignmentRow & { profiles: { full_name: string } | null })[]) {
      asgMap.set(a.first_timer_id, { ...a, assignee_name: a.profiles?.full_name ?? null });
    }
    const ovMap = new Map<string, PipelineOverviewRow>();
    for (const o of ovRows ?? []) ovMap.set(o.first_timer_id, o);

    return (ftRows ?? []).map((r) => ({
      ...r,
      fbRows: fbMap.get(r.id) ?? [],
      assignment: asgMap.get(r.id) ?? null,
      overview: ovMap.get(r.id) ?? null,
    }));
  },

  async assign(firstTimerId: string, assignedTo: string, assignedBy: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("call_assignments")
      .upsert({ first_timer_id: firstTimerId, assigned_to: assignedTo, assigned_by: assignedBy }, { onConflict: "first_timer_id" });
    if (error) throw new Error(error.message);
  },

  async unassign(firstTimerId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("call_assignments").delete().eq("first_timer_id", firstTimerId);
    if (error) throw new Error(error.message);
  },

  async bulkAssign(firstTimerIds: string[], assignedTo: string, assignedBy: string) {
    const supabase = await createClient();
    const payload = firstTimerIds.map((id) => ({ first_timer_id: id, assigned_to: assignedTo, assigned_by: assignedBy }));
    const { error } = await supabase.from("call_assignments").upsert(payload, { onConflict: "first_timer_id" });
    if (error) throw new Error(error.message);
  },

  async getFeedbackForWeek(firstTimerId: string, week: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("call_feedback")
      .select("*")
      .eq("first_timer_id", firstTimerId)
      .eq("week_number", week)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async saveFeedback(input: Database["public"]["Tables"]["call_feedback"]["Insert"], existingId?: string) {
    const supabase = await createClient();
    if (existingId) {
      const updatable = {
        call_status: input.call_status,
        experience_rating: input.experience_rating,
        returning: input.returning,
        notes: input.notes,
        follow_up_date: input.follow_up_date,
        flagged_for_pastoral: input.flagged_for_pastoral,
        flag_reason: input.flag_reason,
        church_attendance: input.church_attendance,
      };
      const { error } = await supabase.from("call_feedback").update(updatable).eq("id", existingId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("call_feedback").insert(input);
      if (error) throw new Error(error.message);
    }
  },

  async getOverview(firstTimerId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("pipeline_overviews").select("*").eq("first_timer_id", firstTimerId).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async saveOverview(input: Database["public"]["Tables"]["pipeline_overviews"]["Insert"]) {
    const supabase = await createClient();
    const { error } = await supabase.from("pipeline_overviews").upsert(input, { onConflict: "first_timer_id" });
    if (error) throw new Error(error.message);
  },

  async listCompleted({ search, dateFrom, dateTo }: { search?: string; dateFrom?: string; dateTo?: string } = {}) {
    const supabase = await createClient();
    let query = supabase
      .from("pipeline_overviews")
      .select("*, first_timers(full_name, phone, service_date, gender)")
      .order("submitted_at", { ascending: false })
      .limit(500);
    if (dateFrom) query = query.gte("submitted_at", dateFrom);
    if (dateTo) query = query.lte("submitted_at", `${dateTo}T23:59:59`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    let rows = (data ?? []) as unknown as (PipelineOverviewRow & {
      first_timers: { full_name: string; phone: string; service_date: string; gender: string | null } | null;
    })[];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.first_timers?.full_name?.toLowerCase().includes(q) || r.submitted_by?.toLowerCase().includes(q));
    }
    return rows;
  },
};
