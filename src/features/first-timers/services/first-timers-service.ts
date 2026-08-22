import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { FirstTimerInput } from "../schemas/first-timer-schema";
import type { Database } from "@/types/database";

export type FirstTimerRow = Database["public"]["Tables"]["first_timers"]["Row"];

export interface FirstTimersQuery {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

function toNullable(v: string | undefined): string | null {
  return v === undefined || v === "" ? null : v;
}

function toPayload(input: FirstTimerInput) {
  return {
    full_name: input.full_name.trim(),
    phone: input.phone.trim(),
    email: toNullable(input.email),
    gender: input.gender,
    dob: toNullable(input.dob),
    marital_status: toNullable(input.marital_status),
    house_address: toNullable(input.house_address),
    nearest_landmark: toNullable(input.nearest_landmark),
    membership_decision: toNullable(input.membership_decision),
    life_stage: toNullable(input.life_stage),
    heard_from: toNullable(input.heard_from),
    areas_of_interest: input.areas_of_interest ?? [],
    service_feedback: toNullable(input.service_feedback),
    service_date: input.service_date,
  };
}

export const firstTimersService = {
  async list({ search, dateFrom, dateTo, page = 1, pageSize = 20 }: FirstTimersQuery) {
    const supabase = await createClient();
    let query = supabase
      .from("first_timers")
      .select("*", { count: "exact" })
      .order("service_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    if (dateFrom) query = query.gte("service_date", dateFrom);
    if (dateTo) query = query.lte("service_date", dateTo);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { rows: data ?? [], total: count ?? 0 };
  },

  async getById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("first_timers").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    return data;
  },

  /** Loose phone-suffix dedupe check, matches V1's findFirstTimerDupes(). */
  async findDupesByPhone(phone: string, excludeId?: string) {
    const key = phone.replace(/\D/g, "").slice(-10);
    if (!key) return [];
    const supabase = await createClient();
    let query = supabase
      .from("first_timers")
      .select("id, full_name, phone, service_date, membership_decision")
      .ilike("phone", `%${key}%`)
      .limit(5);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error) return [];
    return data ?? [];
  },

  async create(input: FirstTimerInput, createdBy?: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("first_timers")
      .insert({ ...toPayload(input), ...(createdBy ? { created_by: createdBy } : {}) })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, input: FirstTimerInput) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("first_timers").update(toPayload(input)).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async bulkImport(rows: FirstTimerInput[], createdBy?: string) {
    const supabase = await createClient();
    const payload = rows.map((r) => ({ ...toPayload(r), ...(createdBy ? { created_by: createdBy } : {}) }));
    const { data, error } = await supabase.from("first_timers").insert(payload).select("id");
    if (error) throw new Error(error.message);
    return data?.length ?? 0;
  },
};
