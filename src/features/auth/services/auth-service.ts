import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/config/roles";
import type { LoginInput } from "../schemas/login-schema";
export interface CurrentUser { id: string; email: string | null; fullName: string; role: AppRole; isActive: boolean; }
export const authService = {
  async signIn({ email, password }: LoginInput) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: mapAuthError(error.message) };
    return { data };
  },
  async signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
  },
  async getCurrentUser(): Promise<CurrentUser | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile, error } = await supabase.from("profiles").select("full_name, role, is_active").eq("id", user.id).single();
    if (error || !profile) return null;
    return { id: user.id, email: user.email ?? null, fullName: profile.full_name, role: profile.role, isActive: profile.is_active };
  },
};
function mapAuthError(message: string): string {
  if (message.toLowerCase().includes("invalid login")) return "Incorrect email or password.";
  return message;
}
