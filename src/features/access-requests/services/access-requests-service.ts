import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export type AccessRequestRow = Database["public"]["Tables"]["access_requests"]["Row"];

export const accessRequestsService = {
  async submit(input: Database["public"]["Tables"]["access_requests"]["Insert"]) {
    const supabase = await createClient();
    const { error } = await supabase.from("access_requests").insert(input);
    if (error) throw new Error(error.message);
  },

  async listPending() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("access_requests").select("*").eq("status", "Pending").order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async listAll() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("access_requests").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /**
   * Approving a request actually creates the person's real login —
   * a Supabase Auth user via the service-role admin API, with
   * user_metadata carrying full_name/role. The existing
   * handle_new_user() trigger (from migration 0001) picks that up
   * automatically and creates the matching profiles row, so this
   * function doesn't need to touch `profiles` directly.
   *
   * Returns the temporary password so the admin can hand it to the
   * new team member (they should change it on first login).
   */
  async approve(requestId: string, reviewerId: string): Promise<{ tempPassword: string; email: string }> {
    const supabase = await createClient();
    const { data: request, error: fetchErr } = await supabase.from("access_requests").select("*").eq("id", requestId).single();
    if (fetchErr || !request) throw new Error("Access request not found.");
    if (request.status !== "Pending") throw new Error("This request has already been reviewed.");

    const tempPassword = generateTempPassword();
    const admin = createAdminClient();
    const { error: createErr } = await admin.auth.admin.createUser({
      email: request.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: request.full_name, role: request.requested_role },
    });
    if (createErr) throw new Error(createErr.message);

    const { error: updateErr } = await supabase
      .from("access_requests")
      .update({ status: "Approved", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
      .eq("id", requestId);
    if (updateErr) throw new Error(updateErr.message);

    return { tempPassword, email: request.email };
  },

  async deny(requestId: string, reviewerId: string, reason: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("access_requests")
      .update({ status: "Denied", reviewed_by: reviewerId, reviewed_at: new Date().toISOString(), denial_reason: reason || null })
      .eq("id", requestId);
    if (error) throw new Error(error.message);
  },

  async listProfiles() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("profiles").select("*").order("full_name");
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async setProfileActive(userId: string, isActive: boolean) {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
    if (error) throw new Error(error.message);
  },

  async setProfileRole(userId: string, role: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ role: role as never }).eq("id", userId);
    if (error) throw new Error(error.message);
  },

  /** Direct admin-created account (no request needed) — same
   *  createUser + trigger-populates-profile mechanism as approve(). */
  async createDirectly(fullName: string, email: string, role: string): Promise<{ tempPassword: string }> {
    const tempPassword = generateTempPassword();
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (error) throw new Error(error.message);
    return { tempPassword };
  },
};

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
