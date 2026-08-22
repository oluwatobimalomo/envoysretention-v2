import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { TestimonyEntry } from "../constants";

export const testimoniesService = {
  async submitPublic(input: Database["public"]["Tables"]["public_testimonies"]["Insert"]) {
    const supabase = await createClient();
    const { error } = await supabase.from("public_testimonies").insert(input);
    if (error) throw new Error(error.message);
  },

  /** Testimonies — sourced from soul_care_visits.testimony (Module 5),
   *  shared during pastoral visits, not the public form. */
  async listVisitTestimonies({ search, dateFrom, dateTo }: { search?: string; dateFrom?: string; dateTo?: string } = {}): Promise<TestimonyEntry[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("soul_care_visits")
      .select("id, testimony, visit_date, soul_care_contacts(full_name)")
      .not("testimony", "is", null)
      .order("visit_date", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);

    type Row = { id: string; testimony: string | null; visit_date: string | null; soul_care_contacts: { full_name: string } | null };
    let entries: TestimonyEntry[] = ((data ?? []) as unknown as Row[])
      .filter((r) => r.testimony?.trim())
      .map((r) => ({ id: r.id, display_name: r.soul_care_contacts?.full_name ?? "Anonymous", category: null, testimony: r.testimony!, date: r.visit_date ?? "" }));

    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((e) => e.display_name.toLowerCase().includes(q) || e.testimony.toLowerCase().includes(q));
    }
    if (dateFrom) entries = entries.filter((e) => e.date >= dateFrom);
    if (dateTo) entries = entries.filter((e) => e.date <= dateTo);
    return entries;
  },

  /** Testimony Bank — public_testimonies only. */
  async listBank({ search, category, dateFrom, dateTo }: { search?: string; category?: string; dateFrom?: string; dateTo?: string } = {}): Promise<TestimonyEntry[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("public_testimonies").select("*").order("submitted_at", { ascending: false }).limit(1000);
    if (error) throw new Error(error.message);

    let entries: TestimonyEntry[] = (data ?? []).map((r) => ({
      id: r.id, display_name: r.name || "Anonymous", category: r.category, testimony: r.testimony, date: r.submitted_at?.slice(0, 10) ?? "",
    }));

    if (category) entries = entries.filter((e) => e.category === category);
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((e) => e.display_name.toLowerCase().includes(q) || e.testimony.toLowerCase().includes(q));
    }
    if (dateFrom) entries = entries.filter((e) => e.date >= dateFrom);
    if (dateTo) entries = entries.filter((e) => e.date <= dateTo);
    return entries;
  },
};
