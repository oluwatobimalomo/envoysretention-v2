import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type FirstTimerRow = Database["public"]["Tables"]["first_timers"]["Row"];
export type VipAssignmentRow = Database["public"]["Tables"]["vip_message_assignments"]["Row"];

export interface EnrichedVip extends FirstTimerRow {
  vip: (VipAssignmentRow & { assignee_name: string | null }) | null;
}

export const vipContactService = {
  async listEnriched({ dateFrom, dateTo }: { dateFrom?: string; dateTo?: string } = {}): Promise<EnrichedVip[]> {
    const supabase = await createClient();
    let ftQuery = supabase.from("first_timers").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(500);
    if (dateFrom) ftQuery = ftQuery.gte("service_date", dateFrom);
    if (dateTo) ftQuery = ftQuery.lte("service_date", dateTo);

    const [{ data: ftRows, error }, { data: vmRows }] = await Promise.all([
      ftQuery,
      supabase.from("vip_message_assignments").select("*, profiles!vip_message_assignments_assigned_to_fkey(full_name)"),
    ]);
    if (error) throw new Error(error.message);

    const vmMap = new Map<string, VipAssignmentRow & { assignee_name: string | null }>();
    for (const v of (vmRows ?? []) as (VipAssignmentRow & { profiles: { full_name: string } | null })[]) {
      vmMap.set(v.first_timer_id, { ...v, assignee_name: v.profiles?.full_name ?? null });
    }

    return (ftRows ?? []).map((r) => ({ ...r, vip: vmMap.get(r.id) ?? null }));
  },

  async assign(firstTimerId: string, assignedTo: string, assignedBy: string) {
    const supabase = await createClient();
    const existing = await supabase.from("vip_message_assignments").select("id").eq("first_timer_id", firstTimerId).maybeSingle();
    if (existing.data) {
      const { error } = await supabase.from("vip_message_assignments").update({ assigned_to: assignedTo, assigned_by: assignedBy }).eq("id", existing.data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("vip_message_assignments").insert({ first_timer_id: firstTimerId, assigned_to: assignedTo, assigned_by: assignedBy });
      if (error) throw new Error(error.message);
    }
  },

  async setMessaged(firstTimerId: string, messaged: boolean, userId: string) {
    const supabase = await createClient();
    const existing = await supabase.from("vip_message_assignments").select("id").eq("first_timer_id", firstTimerId).maybeSingle();
    const payload = { messaged, messaged_by: messaged ? userId : null, messaged_at: messaged ? new Date().toISOString() : null };
    if (existing.data) {
      const { error } = await supabase.from("vip_message_assignments").update(payload).eq("id", existing.data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("vip_message_assignments").insert({ first_timer_id: firstTimerId, ...payload });
      if (error) throw new Error(error.message);
    }
  },
};
