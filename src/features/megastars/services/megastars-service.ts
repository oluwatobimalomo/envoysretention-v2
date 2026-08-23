import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { formatDateTime } from "@/lib/format-date";

export type MegastarRow = Database["public"]["Tables"]["megastars"]["Row"];
export type GuardianRow = Database["public"]["Tables"]["megastar_guardians"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["megastar_services"]["Row"];
export type CheckinRow = Database["public"]["Tables"]["megastar_checkins"]["Row"];

export interface FamilyResult {
  guardian: GuardianRow;
  children: MegastarRow[];
  matchedChildIds: Set<string>;
}

export interface EnrichedCheckin extends CheckinRow {
  child_name: string | null;
  child_class: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
}

export const megastarsService = {
  async listRoster({ search, classFilter }: { search?: string; classFilter?: string } = {}) {
    const supabase = await createClient();
    let query = supabase.from("megastars").select("*").order("full_name");
    if (search) query = query.ilike("full_name", `%${search}%`);
    if (classFilter) query = query.eq("class", classFilter);
    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const { data: links } = await supabase.from("megastar_guardian_links").select("*, megastar_guardians(full_name, phone)");
    const linksMap = new Map<string, { full_name: string; phone: string }[]>();
    for (const l of (links ?? []) as { megastar_id: string; megastar_guardians: { full_name: string; phone: string } | null }[]) {
      if (!l.megastar_guardians) continue;
      const list = linksMap.get(l.megastar_id) ?? [];
      list.push(l.megastar_guardians);
      linksMap.set(l.megastar_id, list);
    }

    return (data ?? []).map((c) => ({ ...c, guardians: linksMap.get(c.id) ?? [] }));
  },

  async findGuardianByPhone(phone: string) {
    const key = phone.replace(/\D/g, "").slice(-10);
    if (!key) return null;
    const supabase = await createClient();
    const { data, error } = await supabase.from("megastar_guardians").select("*").ilike("phone", `%${key}%`).limit(1);
    if (error || !data?.length) return null;
    return data[0];
  },

  async searchFamilies(query: string): Promise<FamilyResult[]> {
    const q = query.trim();
    if (!q) return [];
    const supabase = await createClient();

    const [{ data: guardianMatches }, { data: childMatches }, { data: allGuardians }, { data: allChildren }, { data: links }] = await Promise.all([
      supabase.from("megastar_guardians").select("*").or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`).limit(10),
      supabase.from("megastars").select("*").ilike("full_name", `%${q}%`).eq("is_active", true).limit(10),
      supabase.from("megastar_guardians").select("*"),
      supabase.from("megastars").select("*").eq("is_active", true),
      supabase.from("megastar_guardian_links").select("*"),
    ]);

    const guardianMap = new Map((allGuardians ?? []).map((g) => [g.id, g]));
    const childMap = new Map((allChildren ?? []).map((c) => [c.id, c]));
    const matchedChildIds = new Set((childMatches ?? []).map((c) => c.id));

    const familyIds = new Set<string>();
    for (const g of guardianMatches ?? []) familyIds.add(g.id);
    for (const c of childMatches ?? []) {
      for (const l of links ?? []) if (l.megastar_id === c.id) familyIds.add(l.guardian_id);
    }

    const results: FamilyResult[] = [];
    for (const gid of familyIds) {
      const guardian = guardianMap.get(gid);
      if (!guardian) continue;
      const children = (links ?? [])
        .filter((l) => l.guardian_id === gid)
        .map((l) => childMap.get(l.megastar_id))
        .filter((c): c is MegastarRow => !!c);
      results.push({ guardian, children, matchedChildIds });
    }
    return results;
  },

  async createMegastar(input: {
    child_full_name: string; gender: string | null; dob: string | null; class: string | null;
    relationship: string; guardianId?: string; newGuardian?: { full_name: string; phone: string };
    addedBy: string;
  }) {
    const supabase = await createClient();

    let guardianId = input.guardianId;
    if (!guardianId && input.newGuardian) {
      const { data: newGuardian, error: gErr } = await supabase
        .from("megastar_guardians")
        .insert({ full_name: input.newGuardian.full_name, phone: input.newGuardian.phone, added_by: input.addedBy })
        .select()
        .single();
      if (gErr) throw new Error(gErr.message);
      guardianId = newGuardian.id;
    }
    if (!guardianId) throw new Error("No guardian specified.");

    const { data: child, error: cErr } = await supabase
      .from("megastars")
      .insert({ full_name: input.child_full_name, gender: input.gender, dob: input.dob, class: input.class, added_by: input.addedBy })
      .select()
      .single();
    if (cErr) throw new Error(cErr.message);

    const { error: lErr } = await supabase
      .from("megastar_guardian_links")
      .insert({ megastar_id: child.id, guardian_id: guardianId, relationship: input.relationship });
    if (lErr) throw new Error(lErr.message);

    return { child, guardianId };
  },

  async removeFromRoster(childId: string, reason: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("megastars").update({ is_active: false, removed_reason: reason || null, removed_at: new Date().toISOString() }).eq("id", childId);
    if (error) throw new Error(error.message);
  },

  async restoreToRoster(childId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("megastars").update({ is_active: true, removed_reason: null, removed_at: null }).eq("id", childId);
    if (error) throw new Error(error.message);
  },

  async listServices() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("megastar_services").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getOpenService() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("megastar_services").select("*").eq("status", "Open").order("created_at", { ascending: false }).limit(1);
    if (error) throw new Error(error.message);
    return data?.[0] ?? null;
  },

  async openService(label: string, serviceDate: string, createdBy: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("megastar_services").insert({ label, service_date: serviceDate, status: "Open", created_by: createdBy });
    if (error) throw new Error(error.message);
  },

  async closeService(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("megastar_services").update({ status: "Closed", closed_at: new Date().toISOString() }).eq("id", id);
    if (error) throw new Error(error.message);
  },

  async listActiveCheckins(serviceId: string): Promise<EnrichedCheckin[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("megastar_checkins")
      .select("*, megastars(full_name, class), megastar_guardians!megastar_checkins_guardian_id_fkey(full_name, phone)")
      .eq("service_id", serviceId)
      .is("check_out_time", null)
      .order("check_in_time", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as (CheckinRow & { megastars: { full_name: string; class: string | null } | null; megastar_guardians: { full_name: string; phone: string } | null })[]).map((r) => ({
      ...r,
      child_name: r.megastars?.full_name ?? null,
      child_class: r.megastars?.class ?? null,
      guardian_name: r.megastar_guardians?.full_name ?? null,
      guardian_phone: r.megastar_guardians?.phone ?? null,
    }));
  },

  async checkIn(serviceId: string, entries: { childId: string; guardianId: string }[], checkedInBy: string) {
    const supabase = await createClient();
    const { data: children } = await supabase.from("megastars").select("id, class").in("id", entries.map((e) => e.childId));
    const classMap = new Map((children ?? []).map((c) => [c.id, c.class]));
    const payload = entries.map((e) => ({
      service_id: serviceId, megastar_id: e.childId, guardian_id: e.guardianId,
      class_at_checkin: classMap.get(e.childId) ?? null, checked_in_by: checkedInBy,
    }));
    const { error } = await supabase.from("megastar_checkins").insert(payload);
    if (error) throw new Error(error.message);
  },

  async checkOut(checkinId: string, checkedOutBy: string, checkoutGuardianId?: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("megastar_checkins").update({
      check_out_time: new Date().toISOString(),
      checked_out_by: checkedOutBy,
      checkout_guardian_id: checkoutGuardianId ?? null,
    }).eq("id", checkinId);
    if (error) throw new Error(error.message);
  },

  async exportAttendanceCsv(service: ServiceRow) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("megastar_checkins")
      .select("*, megastars(full_name, class), dropoff:megastar_guardians!megastar_checkins_guardian_id_fkey(full_name, phone), pickup:megastar_guardians!megastar_checkins_checkout_guardian_id_fkey(full_name, phone)")
      .eq("service_id", service.id)
      .order("check_in_time", { ascending: true });
    if (error) throw new Error(error.message);

    type Row = CheckinRow & {
      megastars: { full_name: string; class: string | null } | null;
      dropoff: { full_name: string; phone: string } | null;
      pickup: { full_name: string; phone: string } | null;
    };
    const rows = (data ?? []) as unknown as Row[];

    const esc = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
    const header = ["Child Name", "Class", "Dropped Off By", "Guardian Phone", "Check-In Time", "Picked Up By", "Check-Out Time"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push([
        esc(r.megastars?.full_name ?? ""),
        esc(r.class_at_checkin ?? r.megastars?.class ?? ""),
        esc(r.dropoff?.full_name ?? ""),
        esc(r.dropoff?.phone ?? ""),
        esc(r.check_in_time ? formatDateTime(r.check_in_time) : ""),
        esc(r.pickup?.full_name ?? r.dropoff?.full_name ?? ""),
        esc(r.check_out_time ? formatDateTime(r.check_out_time) : "Still checked in"),
      ].join(","));
    }
    return lines.join("\r\n");
  },
};
