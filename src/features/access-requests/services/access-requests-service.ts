import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export type AccessRequestRow = Database["public"]["Tables"]["access_requests"]["Row"];

export const accessRequestsService = {
  /**
   * The requester chooses their own password right now. We create the
   * real Supabase Auth user immediately — Supabase stores the password
   * securely on its own; our code never sees it again after this call —
   * but with is_active=false via the 'pending' metadata flag, so
   * `handle_new_user()` (migration 0014) creates a profile they can't
   * yet use. Approving just flips is_active to true.
   */
  async submit(input: {
    full_name: string; email: string; phone: string | null;
    requested_role: string; message: string | null; password: string;
  }) {
    const admin = createAdminClient();
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.full_name, role: input.requested_role, pending: true },
    });
    if (createErr) {
      if (createErr.message.toLowerCase().includes("already registered") || createErr.message.toLowerCase().includes("already been registered")) {
        throw new Error("An account with this email already exists. Try signing in, or use 'Forgot password?' if you don't remember your password.");
      }
      throw new Error(createErr.message);
    }

    const supabase = await createClient();
    const { error } = await supabase.from("access_requests").insert({
      full_name: input.full_name,
      email: input.email,
      phone: input.phone,
      requested_role: input.requested_role as never,
      message: input.message,
      user_id: created.user.id,
    });
    if (error) throw new Error(error.message);
  },

  async listPending() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("access_requests").select("*").eq("status", "Pending").order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Activates the already-created account — no auth user creation
   *  happens here anymore, and therefore no temp password to hand off;
   *  the person already knows their own password. */
  async approve(requestId: string, reviewerId: string) {
    const supabase = await createClient();
    const { data: request, error: fetchErr } = await supabase.from("access_requests").select("*").eq("id", requestId).single();
    if (fetchErr || !request) throw new Error("Access request not found.");
    if (request.status !== "Pending") throw new Error("This request has already been reviewed.");
    if (!request.user_id) throw new Error("This request has no linked account — it may predate the self-service password update.");

    const { error: activateErr } = await supabase
      .from("profiles")
      .update({ is_active: true, role: request.requested_role })
      .eq("id", request.user_id);
    if (activateErr) throw new Error(activateErr.message);

    const { error: updateErr } = await supabase
      .from("access_requests")
      .update({ status: "Approved", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
      .eq("id", requestId);
    if (updateErr) throw new Error(updateErr.message);
  },

  /** Denying removes the account entirely — matches "this person
   *  shouldn't have access" semantics rather than leaving an orphaned,
   *  permanently-inactive login sitting around. */
  async deny(requestId: string, reviewerId: string, reason: string) {
    const supabase = await createClient();
    const { data: request } = await supabase.from("access_requests").select("user_id").eq("id", requestId).single();

    if (request?.user_id) {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(request.user_id).catch(() => {
        // If the user was already removed some other way, don't block the denial.
      });
    }

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

  /** Direct admin-created account (no request needed) — admin doesn't
   *  know the new person's preferred password, so a temp one still makes
   *  sense here, unlike the self-service path above. */
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

  /** Admin-initiated reset for any existing team member. */
  async resetUserPassword(userId: string): Promise<{ tempPassword: string }> {
    const tempPassword = generateTempPassword();
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, { password: tempPassword });
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
