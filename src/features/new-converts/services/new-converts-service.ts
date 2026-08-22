import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type NewConvertRow = Database["public"]["Tables"]["new_converts"]["Row"];
export type NcAssignmentRow = Database["public"]["Tables"]["new_converts_assignments"]["Row"];
export type NcCheckinRow = Database["public"]["Tables"]["new_converts_checkins"]["Row"];

export interface EnrichedNewConvert extends NewConvertRow {
  fbRows: NcCheckinRow[];
  assignment: (NcAssignmentRow & { assignee_name: string | null }) | null;
}

export const newConvertsService = {
  async listEnriched(): Promise<EnrichedNewConvert[]> {
    const supabase = await createClient();
    const [{ data: ncRows, error }, { data: ciRows }, { data: asgRows }] = await Promise.all([
      supabase.from("new_converts").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1000),
      supabase.from("new_converts_checkins").select("*").order("created_at", { ascending: true }),
      supabase.from("new_converts_assignments").select("*, profiles!new_converts_assignments_assigned_to_fkey(full_name)"),
    ]);
    if (error) throw new Error(error.message);

    const ciMap = new Map<string, NcCheckinRow[]>();
    for (const c of ciRows ?? []) {
      const list = ciMap.get(c.new_convert_id) ?? [];
      list.push(c);
      ciMap.set(c.new_convert_id, list);
    }
    const asgMap = new Map<string, NcAssignmentRow & { assignee_name: string | null }>();
    for (const a of (asgRows ?? []) as (NcAssignmentRow & { profiles: { full_name: string } | null })[]) {
      asgMap.set(a.new_convert_id, { ...a, assignee_name: a.profiles?.full_name ?? null });
    }

    return (ncRows ?? []).map((r) => ({ ...r, fbRows: ciMap.get(r.id) ?? [], assignment: asgMap.get(r.id) ?? null }));
  },

  async list({ search, dateFrom, dateTo }: { search?: string; dateFrom?: string; dateTo?: string } = {}) {
    const supabase = await createClient();
    let query = supabase.from("new_converts").select("*", { count: "exact" }).eq("is_active", true).order("conversion_date", { ascending: false });
    if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    if (dateFrom) query = query.gte("conversion_date", dateFrom);
    if (dateTo) query = query.lte("conversion_date", dateTo);
    const { data, error, count } = await query.limit(500);
    if (error) throw new Error(error.message);
    return { rows: data ?? [], total: count ?? 0 };
  },

  async findDupesByPhone(phone: string) {
    const key = phone.replace(/\D/g, "").slice(-10);
    if (!key) return [];
    const supabase = await createClient();
    const { data, error } = await supabase.from("new_converts").select("id, full_name, phone, conversion_date").ilike("phone", `%${key}%`).limit(5);
    if (error) return [];
    return data ?? [];
  },

  async create(input: Database["public"]["Tables"]["new_converts"]["Insert"]) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("new_converts").insert(input).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async assign(ncId: string, assignedTo: string, assignedBy: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("new_converts_assignments")
      .upsert({ new_convert_id: ncId, assigned_to: assignedTo, assigned_by: assignedBy }, { onConflict: "new_convert_id" });
    if (error) throw new Error(error.message);
  },

  async unassign(ncId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("new_converts_assignments").delete().eq("new_convert_id", ncId);
    if (error) throw new Error(error.message);
  },

  async bulkAssign(ncIds: string[], assignedTo: string, assignedBy: string) {
    const supabase = await createClient();
    const payload = ncIds.map((id) => ({ new_convert_id: id, assigned_to: assignedTo, assigned_by: assignedBy }));
    const { error } = await supabase.from("new_converts_assignments").upsert(payload, { onConflict: "new_convert_id" });
    if (error) throw new Error(error.message);
  },

  async getCheckin(ncId: string, month: number) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("new_converts_checkins").select("*").eq("new_convert_id", ncId).eq("checkin_number", month).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async saveCheckin(input: Database["public"]["Tables"]["new_converts_checkins"]["Insert"], existingId?: string) {
    const supabase = await createClient();
    if (existingId) {
      const { error } = await supabase.from("new_converts_checkins").update({
        call_status: input.call_status, notes: input.notes, follow_up_date: input.follow_up_date,
        flagged_for_pastoral: input.flagged_for_pastoral, flag_reason: input.flag_reason,
      }).eq("id", existingId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("new_converts_checkins").insert(input);
      if (error) throw new Error(error.message);
    }
  },

  async saveTraining(ncId: string, completed: boolean, notes: string | null, scheduledDate: string | null, trainerName: string | null) {
    const supabase = await createClient();
    const { error } = await supabase.from("new_converts").update({
      envoys_training_completed: completed,
      envoys_training_completed_date: completed ? new Date().toISOString().slice(0, 10) : null,
      envoys_training_notes: notes,
      training_scheduled_date: scheduledDate,
      trainer_name: trainerName,
    }).eq("id", ncId);
    if (error) throw new Error(error.message);
  },
};
