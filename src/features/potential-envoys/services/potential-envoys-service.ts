import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type PotentialEnvoyRow = Database["public"]["Tables"]["potential_envoys"]["Row"];
export type PeAssignmentRow = Database["public"]["Tables"]["potential_envoys_assignments"]["Row"];
export type PeFeedbackRow = Database["public"]["Tables"]["potential_envoys_feedback"]["Row"];

export interface EnrichedPotentialEnvoy extends PotentialEnvoyRow {
  fbRows: PeFeedbackRow[];
  assignment: (PeAssignmentRow & { assignee_name: string | null }) | null;
}

export const potentialEnvoysService = {
  async listEnriched(): Promise<EnrichedPotentialEnvoy[]> {
    const supabase = await createClient();
    const [{ data: peRows, error }, { data: fbRows }, { data: asgRows }] = await Promise.all([
      supabase.from("potential_envoys").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("potential_envoys_feedback").select("*").order("created_at", { ascending: true }),
      supabase.from("potential_envoys_assignments").select("*, profiles!potential_envoys_assignments_assigned_to_fkey(full_name)"),
    ]);
    if (error) throw new Error(error.message);

    const fbMap = new Map<string, PeFeedbackRow[]>();
    for (const f of fbRows ?? []) {
      const list = fbMap.get(f.potential_envoy_id) ?? [];
      list.push(f);
      fbMap.set(f.potential_envoy_id, list);
    }
    const asgMap = new Map<string, PeAssignmentRow & { assignee_name: string | null }>();
    for (const a of (asgRows ?? []) as (PeAssignmentRow & { profiles: { full_name: string } | null })[]) {
      asgMap.set(a.potential_envoy_id, { ...a, assignee_name: a.profiles?.full_name ?? null });
    }

    return (peRows ?? []).map((r) => ({ ...r, fbRows: fbMap.get(r.id) ?? [], assignment: asgMap.get(r.id) ?? null }));
  },

  async assign(peId: string, assignedTo: string, assignedBy: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("potential_envoys_assignments")
      .upsert({ potential_envoy_id: peId, assigned_to: assignedTo, assigned_by: assignedBy }, { onConflict: "potential_envoy_id" });
    if (error) throw new Error(error.message);
  },

  async unassign(peId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("potential_envoys_assignments").delete().eq("potential_envoy_id", peId);
    if (error) throw new Error(error.message);
  },

  async bulkAssign(peIds: string[], assignedTo: string, assignedBy: string) {
    const supabase = await createClient();
    const payload = peIds.map((id) => ({ potential_envoy_id: id, assigned_to: assignedTo, assigned_by: assignedBy }));
    const { error } = await supabase.from("potential_envoys_assignments").upsert(payload, { onConflict: "potential_envoy_id" });
    if (error) throw new Error(error.message);
  },

  async getFeedbackForWeek(peId: string, week: number) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("potential_envoys_feedback").select("*").eq("potential_envoy_id", peId).eq("week_number", week).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async saveFeedback(input: Database["public"]["Tables"]["potential_envoys_feedback"]["Insert"], existingId?: string) {
    const supabase = await createClient();
    if (existingId) {
      const { error } = await supabase.from("potential_envoys_feedback").update({
        call_status: input.call_status, notes: input.notes, follow_up_date: input.follow_up_date,
        flagged_for_pastoral: input.flagged_for_pastoral, flag_reason: input.flag_reason,
      }).eq("id", existingId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("potential_envoys_feedback").insert(input);
      if (error) throw new Error(error.message);
    }
  },

  async saveTraining(peId: string, completed: boolean, notes: string | null) {
    const supabase = await createClient();
    const { error } = await supabase.from("potential_envoys").update({
      training_completed: completed,
      training_completed_date: completed ? new Date().toISOString().slice(0, 10) : null,
      training_notes: notes,
    }).eq("id", peId);
    if (error) throw new Error(error.message);
  },

  async promote(peId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("potential_envoys").update({ promoted_to_membership: true }).eq("id", peId);
    if (error) throw new Error(error.message);
  },
};
