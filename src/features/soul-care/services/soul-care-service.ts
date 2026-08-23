import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ContactRow = Database["public"]["Tables"]["soul_care_contacts"]["Row"];
export type AssignmentRow = Database["public"]["Tables"]["soul_care_assignments"]["Row"];
export type VisitRow = Database["public"]["Tables"]["soul_care_visits"]["Row"];

export interface EnrichedContact extends ContactRow {
  assignment: (AssignmentRow & { assignee_name: string | null }) | null;
  visits: VisitRow[];
}

export const soulCareService = {
  async listEnriched({ search, dateFrom, dateTo }: { search?: string; dateFrom?: string; dateTo?: string } = {}): Promise<EnrichedContact[]> {
    const supabase = await createClient();
    let contactsQuery = supabase.from("soul_care_contacts").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1000);
    if (search) contactsQuery = contactsQuery.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    if (dateFrom) contactsQuery = contactsQuery.gte("created_at", dateFrom);
    if (dateTo) contactsQuery = contactsQuery.lte("created_at", `${dateTo}T23:59:59`);

    const [{ data: contacts, error }, { data: assignments }, { data: visits }] = await Promise.all([
      contactsQuery,
      supabase.from("soul_care_assignments").select("*, profiles!soul_care_assignments_assigned_to_fkey(full_name)"),
      supabase.from("soul_care_visits").select("*").order("created_at", { ascending: false }),
    ]);
    if (error) throw new Error(error.message);

    const asgMap = new Map<string, AssignmentRow & { assignee_name: string | null }>();
    for (const a of (assignments ?? []) as (AssignmentRow & { profiles: { full_name: string } | null })[]) {
      asgMap.set(a.contact_id, { ...a, assignee_name: a.profiles?.full_name ?? null });
    }
    const visitMap = new Map<string, VisitRow[]>();
    for (const v of visits ?? []) {
      const list = visitMap.get(v.contact_id) ?? [];
      list.push(v);
      visitMap.set(v.contact_id, list);
    }

    return (contacts ?? []).map((c) => ({
      ...c,
      assignment: asgMap.get(c.id) ?? null,
      visits: visitMap.get(c.id) ?? [],
    }));
  },

  async getContact(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("soul_care_contacts").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    return data;
  },

  async searchByNameOrPhone(query: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("soul_care_contacts")
      .select("*")
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async createContact(input: Database["public"]["Tables"]["soul_care_contacts"]["Insert"]) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("soul_care_contacts").insert(input).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async bulkImportContacts(inputs: Database["public"]["Tables"]["soul_care_contacts"]["Insert"][]) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("soul_care_contacts").insert(inputs).select("id");
    if (error) throw new Error(error.message);
    return data?.length ?? 0;
  },

  async assign(contactId: string, assignedTo: string, assignedBy: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("soul_care_assignments")
      .upsert({ contact_id: contactId, assigned_to: assignedTo, assigned_by: assignedBy }, { onConflict: "contact_id" });
    if (error) throw new Error(error.message);
  },

  async unassign(contactId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("soul_care_assignments").delete().eq("contact_id", contactId);
    if (error) throw new Error(error.message);
  },

  async logVisit(input: Database["public"]["Tables"]["soul_care_visits"]["Insert"]) {
    const supabase = await createClient();
    const { error } = await supabase.from("soul_care_visits").insert(input);
    if (error) throw new Error(error.message);
  },

  async updateVisit(id: string, input: Database["public"]["Tables"]["soul_care_visits"]["Update"]) {
    const supabase = await createClient();
    const { error } = await supabase.from("soul_care_visits").update(input).eq("id", id);
    if (error) throw new Error(error.message);
  },

  async listFlagged({ dateFrom, dateTo }: { dateFrom?: string; dateTo?: string } = {}) {
    const supabase = await createClient();
    let query = supabase
      .from("soul_care_visits")
      .select("*, soul_care_contacts(full_name, phone, gender)")
      .eq("escalate_to_pastorate", true)
      .order("created_at", { ascending: false });
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const now = Date.now();
    const rows = (data ?? []) as unknown as (VisitRow & {
      soul_care_contacts: { full_name: string; phone: string; gender: string | null } | null;
    })[];
    return rows.map((r) => ({ ...r, daysOpen: Math.floor((now - new Date(r.created_at).getTime()) / 86_400_000) }));
  },
};

export async function listAllVisitations({ dateFrom, dateTo, status }: { dateFrom?: string; dateTo?: string; status?: string } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("soul_care_visits")
    .select("*, soul_care_contacts(full_name, phone, gender, marital_status, life_stage)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (dateFrom) query = query.gte("visit_date", dateFrom);
  if (dateTo) query = query.lte("visit_date", dateTo);
  if (status) query = query.eq("visit_status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as (VisitRow & {
    soul_care_contacts: { full_name: string; phone: string; gender: string | null; marital_status: string | null; life_stage: string | null } | null;
  })[];
}
