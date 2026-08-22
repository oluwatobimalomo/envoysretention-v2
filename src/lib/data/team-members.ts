import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/config/roles";

/** Ported from V1's useRoleUsers(role) — lists active profiles for a given
 *  role, used to populate assignment dropdowns (Assign Calls, VIP Contact,
 *  Assign Visits). */
export async function getTeamMembersByRole(role: AppRole) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", role)
    .eq("is_active", true)
    .order("full_name");
  if (error) throw new Error(error.message);
  return data ?? [];
}
