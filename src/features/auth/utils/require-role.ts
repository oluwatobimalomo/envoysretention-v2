import "server-only";
import { redirect } from "next/navigation";
import { authService, type CurrentUser } from "../services/auth-service";
import type { AppRole } from "@/lib/config/roles";
export async function requireUser(): Promise<CurrentUser> {
  const user = await authService.getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
export async function requireRole(allowed: AppRole[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) redirect("/403");
  return user;
}
