"use server";

import { revalidatePath } from "next/cache";
import { accessRequestSchema } from "../schemas/access-request-schema";
import { accessRequestsService } from "../services/access-requests-service";
import { requireRole } from "@/features/auth/utils/require-role";

export interface AccessRequestActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

export async function submitAccessRequestAction(
  _prev: AccessRequestActionState,
  formData: FormData
): Promise<AccessRequestActionState & { success?: boolean }> {
  const parsed = accessRequestSchema.safeParse({
    full_name: str(formData, "full_name"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    requested_role: str(formData, "requested_role"),
    message: str(formData, "message"),
    password: str(formData, "password"),
    confirm_password: str(formData, "confirm_password"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  try {
    await accessRequestsService.submit({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      requested_role: parsed.data.requested_role,
      message: parsed.data.message || null,
      password: parsed.data.password,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong. Please try again." };
  }
  return { error: null, success: true };
}

export async function approveAccessRequestAction(requestId: string) {
  const user = await requireRole(["admin"]);
  await accessRequestsService.approve(requestId, user.id);
  revalidatePath("/admin/users");
}

export async function denyAccessRequestAction(requestId: string, reason: string) {
  const user = await requireRole(["admin"]);
  await accessRequestsService.deny(requestId, user.id, reason);
  revalidatePath("/admin/users");
}

export async function setProfileActiveAction(userId: string, isActive: boolean) {
  await requireRole(["admin"]);
  await accessRequestsService.setProfileActive(userId, isActive);
  revalidatePath("/admin/users");
}

export async function setProfileRoleAction(userId: string, role: string) {
  await requireRole(["admin"]);
  await accessRequestsService.setProfileRole(userId, role);
  revalidatePath("/admin/users");
}

export async function resetUserPasswordAction(userId: string) {
  await requireRole(["admin"]);
  return accessRequestsService.resetUserPassword(userId);
}

export interface CreateUserActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

export async function createUserDirectlyAction(
  _prev: CreateUserActionState,
  formData: FormData
): Promise<CreateUserActionState & { success?: boolean; tempPassword?: string }> {
  await requireRole(["admin"]);
  const fullName = str(formData, "full_name");
  const email = str(formData, "email");
  const role = str(formData, "role");

  if (!fullName || fullName.length < 2) return { error: "Enter the person's full name.", fieldErrors: { full_name: "Required" } };
  if (!email || !email.includes("@")) return { error: "Enter a valid email.", fieldErrors: { email: "Required" } };
  if (!role) return { error: "Select a role.", fieldErrors: { role: "Required" } };

  try {
    const { tempPassword } = await accessRequestsService.createDirectly(fullName, email, role);
    revalidatePath("/admin/users");
    return { error: null, success: true, tempPassword };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
