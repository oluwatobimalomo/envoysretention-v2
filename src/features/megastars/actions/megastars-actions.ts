"use server";

import { revalidatePath } from "next/cache";
import { megastarsService } from "../services/megastars-service";
import { addMegastarSchema, openServiceSchema, type AddMegastarInput } from "../schemas/megastar-schema";
import { requireRole } from "@/features/auth/utils/require-role";

export interface MegastarActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

export async function lookupGuardianAction(phone: string) {
  await requireRole(["admin", "dofficer", "megastars", "megastarsadmin"]);
  return megastarsService.findGuardianByPhone(phone);
}

export async function searchFamiliesAction(query: string) {
  await requireRole(["admin", "dofficer", "megastars", "megastarsadmin"]);
  return megastarsService.searchFamilies(query);
}

export async function addMegastarAction(_prev: MegastarActionState, formData: FormData): Promise<MegastarActionState & { success?: boolean }> {
  const user = await requireRole(["admin", "dofficer", "megastars", "megastarsadmin"]);

  const parsed = addMegastarSchema.safeParse({
    child_full_name: str(formData, "child_full_name"),
    gender: str(formData, "gender"),
    dob: str(formData, "dob"),
    class: str(formData, "class"),
    relationship: str(formData, "relationship") || "Parent",
    guardian_mode: str(formData, "guardian_mode") || "new",
    existing_guardian_id: str(formData, "existing_guardian_id"),
    guardian_full_name: str(formData, "guardian_full_name"),
    guardian_phone: str(formData, "guardian_phone"),
  } satisfies Record<keyof AddMegastarInput, string>);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    await megastarsService.createMegastar({
      child_full_name: parsed.data.child_full_name,
      gender: parsed.data.gender || null,
      dob: parsed.data.dob || null,
      class: parsed.data.class || null,
      relationship: parsed.data.relationship,
      guardianId: parsed.data.guardian_mode === "existing" ? parsed.data.existing_guardian_id : undefined,
      newGuardian: parsed.data.guardian_mode === "new"
        ? { full_name: parsed.data.guardian_full_name!, phone: parsed.data.guardian_phone! }
        : undefined,
      addedBy: user.id,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }

  revalidatePath("/megastars/roster");
  revalidatePath("/megastars/check-in-out");
  return { error: null, success: true };
}

export async function removeFromRosterAction(childId: string, reason: string) {
  await requireRole(["admin", "megastarsadmin"]);
  await megastarsService.removeFromRoster(childId, reason);
  revalidatePath("/megastars/roster");
}

export async function restoreToRosterAction(childId: string) {
  await requireRole(["admin", "megastarsadmin"]);
  await megastarsService.restoreToRoster(childId);
  revalidatePath("/megastars/roster");
}

export async function openServiceAction(_prev: MegastarActionState, formData: FormData): Promise<MegastarActionState> {
  const user = await requireRole(["admin", "dofficer", "megastarsadmin"]);
  const parsed = openServiceSchema.safeParse({ label: str(formData, "label"), service_date: str(formData, "service_date") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    await megastarsService.openService(parsed.data.label, parsed.data.service_date, user.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
  revalidatePath("/megastars/services");
  return { error: null };
}

export async function closeServiceAction(id: string) {
  await requireRole(["admin", "dofficer", "megastarsadmin"]);
  await megastarsService.closeService(id);
  revalidatePath("/megastars/services");
}

export async function checkInAction(serviceId: string, entries: { childId: string; guardianId: string }[]) {
  const user = await requireRole(["admin", "dofficer", "megastars", "megastarsadmin"]);
  await megastarsService.checkIn(serviceId, entries, user.id);
  revalidatePath("/megastars/check-in-out");
}

export async function checkOutAction(checkinId: string, checkoutGuardianId?: string) {
  const user = await requireRole(["admin", "dofficer", "megastars", "megastarsadmin"]);
  await megastarsService.checkOut(checkinId, user.id, checkoutGuardianId);
  revalidatePath("/megastars/check-in-out");
}

export async function exportAttendanceAction(serviceId: string) {
  await requireRole(["admin", "dofficer", "megastars", "megastarsadmin"]);
  const services = await megastarsService.listServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) throw new Error("Service not found.");
  return megastarsService.exportAttendanceCsv(service);
}
