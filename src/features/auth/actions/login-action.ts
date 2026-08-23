"use server";
import { redirect } from "next/navigation";
import { loginSchema } from "../schemas/login-schema";
import { authService } from "../services/auth-service";
import { DEFAULT_ROUTE } from "@/lib/config/roles";
export interface LoginActionState { error: string | null; }
export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const result = await authService.signIn(parsed.data);
  if (result.error) return { error: result.error };
  const user = await authService.getCurrentUser();
  if (!user) return { error: "Signed in, but no profile was found for this account." };
  if (!user.isActive) return { error: "This account isn't active yet — either your access request is still pending admin approval, or your account has been deactivated. Contact an administrator if this seems wrong." };
  redirect(DEFAULT_ROUTE[user.role]);
}
export async function logoutAction() {
  await authService.signOut();
  redirect("/login");
}
