import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { phoneKey } from "../constants";

export type ChurchMemberRow = Database["public"]["Tables"]["church_members"]["Row"];

export interface EnrichedMember extends ChurchMemberRow {
  inPool: boolean;
  lastVisit: string | null;
  lastCall: string | null;
}

/** Shared by Stewards Care / Members Care / Care Priority List — fetches
 *  church_members plus the derived "in visit pool" / "last visit" /
 *  "last call" data by matching phone numbers against soul_care_contacts
 *  and soul_care_visits, exactly like V1's StewardsCare/MembersCare did. */
async function enrichWithPoolData(members: ChurchMemberRow[]): Promise<EnrichedMember[]> {
  const supabase = await createClient();
  const [{ data: pool }, { data: visits }] = await Promise.all([
    supabase.from("soul_care_contacts").select("id, phone").eq("is_active", true),
    supabase.from("soul_care_visits").select("contact_id, visit_date, visit_type"),
  ]);

  const poolKeys = new Set((pool ?? []).map((c) => phoneKey(c.phone)).filter(Boolean));
  const contactKeyById = new Map((pool ?? []).map((c) => [c.id, phoneKey(c.phone)]));

  const lastVisitByKey = new Map<string, string>();
  const lastCallByKey = new Map<string, string>();
  for (const v of visits ?? []) {
    const key = contactKeyById.get(v.contact_id);
    if (!key || !v.visit_date) continue;
    const target = v.visit_type === "Phone Call" ? lastCallByKey : lastVisitByKey;
    const existing = target.get(key);
    if (!existing || v.visit_date > existing) target.set(key, v.visit_date);
  }

  return members.map((m) => {
    const key = phoneKey(m.phone);
    return {
      ...m,
      inPool: poolKeys.has(key),
      lastVisit: lastVisitByKey.get(key) ?? null,
      lastCall: lastCallByKey.get(key) ?? null,
    };
  });
}

export const churchMembersService = {
  async listByCategory(category: "Steward" | "Member"): Promise<EnrichedMember[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("church_members").select("*").eq("category", category).order("created_at", { ascending: false }).limit(3000);
    if (error) throw new Error(error.message);
    return enrichWithPoolData(data ?? []);
  },

  async listInactive(): Promise<(EnrichedMember & { lastContact: string | null; daysSince: number | null })[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("church_members").select("*").eq("membership_status", "Inactive").order("full_name").limit(1000);
    if (error) throw new Error(error.message);
    const enriched = await enrichWithPoolData(data ?? []);
    const now = Date.now();
    return enriched.map((m) => {
      const lastContact = m.lastVisit && m.lastCall ? (m.lastVisit > m.lastCall ? m.lastVisit : m.lastCall) : (m.lastVisit ?? m.lastCall);
      const daysSince = lastContact ? Math.floor((now - new Date(lastContact).getTime()) / 86_400_000) : null;
      return { ...m, lastContact, daysSince };
    });
  },

  async setStatus(id: string, status: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("church_members").update({ membership_status: status }).eq("id", id);
    if (error) throw new Error(error.message);
  },

  async addToPool(member: ChurchMemberRow) {
    const supabase = await createClient();
    const { error } = await supabase.from("soul_care_contacts").insert({
      full_name: member.full_name, phone: member.phone, email: member.email,
      gender: member.gender, house_address: member.house_address, nearest_landmark: member.nearest_landmark,
      marital_status: member.marital_status, life_stage: member.life_stage, dob: member.dob,
      original_first_timer_id: null,
    });
    if (error) throw new Error(error.message);
  },

  async bulkImport(rows: Database["public"]["Tables"]["church_members"]["Insert"][]) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("church_members").insert(rows).select("id");
    if (error) throw new Error(error.message);
    return data?.length ?? 0;
  },
};
