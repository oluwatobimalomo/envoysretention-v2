"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { newConvertSchema, checkinSchema } from "../schemas/new-convert-schema";
import { newConvertsService } from "../services/new-converts-service";
import { requireRole, requireUser } from "@/features/auth/utils/require-role";

export interface NcActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

export async function createNewConvertAction(_prev: NcActionState, formData: FormData): Promise<NcActionState> {
  const user = await requireRole(["admin", "dofficer", "soulcareadmin"]);
  const parsed = newConvertSchema.safeParse({
    full_name: str(formData, "full_name"),
    phone: str(formData, "phone"),
    gender: str(formData, "gender"),
    conversion_type: str(formData, "conversion_type") || "New Salvation",
    conversion_date: str(formData, "conversion_date"),
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
    await newConvertsService.create({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      gender: parsed.data.gender || null,
      conversion_type: parsed.data.conversion_type,
      conversion_date: parsed.data.conversion_date,
      source: "Manual",
      added_by: user.id,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
  revalidatePath("/new-converts");
  redirect("/new-converts");
}

export async function publicRegisterNewConvertAction(
  _prev: NcActionState,
  formData: FormData
): Promise<NcActionState & { success?: boolean }> {
  const parsed = newConvertSchema.safeParse({
    full_name: str(formData, "full_name"),
    phone: str(formData, "phone"),
    gender: str(formData, "gender"),
    conversion_type: str(formData, "conversion_type") || "New Salvation",
    conversion_date: str(formData, "conversion_date") || new Date().toISOString().slice(0, 10),
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
    await newConvertsService.create({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      gender: parsed.data.gender || null,
      conversion_type: parsed.data.conversion_type,
      conversion_date: parsed.data.conversion_date,
      source: "Public Form",
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong. Please try again." };
  }
  return { error: null, success: true };
}

export async function checkDupesAction(phone: string) {
  await requireUser();
  return newConvertsService.findDupesByPhone(phone);
}

export async function assignNcAction(ncId: string, assignedTo: string) {
  const user = await requireRole(["admin", "soulcareadmin"]);
  await newConvertsService.assign(ncId, assignedTo, user.id);
  revalidatePath("/new-converts/assign");
}

export async function unassignNcAction(ncId: string) {
  await requireRole(["admin", "soulcareadmin"]);
  await newConvertsService.unassign(ncId);
  revalidatePath("/new-converts/assign");
}

export async function bulkAssignNcAction(ncIds: string[], assignedTo: string) {
  const user = await requireRole(["admin", "soulcareadmin"]);
  await newConvertsService.bulkAssign(ncIds, assignedTo, user.id);
  revalidatePath("/new-converts/assign");
}

export async function logCheckinAction(
  ncId: string,
  month: number,
  callerName: string,
  _prev: NcActionState,
  formData: FormData
): Promise<NcActionState & { success?: boolean }> {
  const user = await requireRole(["admin", "soulcareadmin", "soulcareteam"]);
  const parsed = checkinSchema.safeParse({
    call_status: str(formData, "call_status"),
    notes: str(formData, "notes"),
    follow_up_date: str(formData, "follow_up_date"),
    flagged_for_pastoral: formData.get("flagged_for_pastoral") === "on",
    flag_reason: str(formData, "flag_reason"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const existing = await newConvertsService.getCheckin(ncId, month);
  try {
    await newConvertsService.saveCheckin(
      {
        new_convert_id: ncId,
        checkin_number: month,
        call_status: parsed.data.call_status,
        notes: parsed.data.notes || null,
        follow_up_date: parsed.data.follow_up_date || null,
        caller_name: callerName,
        caller_id: user.id,
        flagged_for_pastoral: parsed.data.flagged_for_pastoral,
        flag_reason: parsed.data.flagged_for_pastoral ? parsed.data.flag_reason || null : null,
      },
      existing?.id
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
  revalidatePath("/new-converts/mine");
  return { error: null, success: true };
}

export async function saveTrainingAction(ncId: string, completed: boolean, notes: string, scheduledDate: string, trainerName: string) {
  await requireRole(["admin", "soulcareadmin", "soulcareteam"]);
  await newConvertsService.saveTraining(ncId, completed, notes || null, scheduledDate || null, trainerName || null);
  revalidatePath("/new-converts/mine");
  revalidatePath("/new-converts/assign");
}

export async function exportNewConvertsCsvAction(query: { search?: string; dateFrom?: string; dateTo?: string } = {}) {
  await requireRole(["admin", "dofficer", "soulcareadmin"]);
  const { rows } = await newConvertsService.list(query);
  const headers = ["full_name", "phone", "gender", "conversion_type", "conversion_date", "envoys_training_completed"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => csvEscape(String((r as unknown as Record<string, unknown>)[h] ?? ""))).join(","));
  }
  return lines.join("\r\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
