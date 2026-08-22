"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { firstTimerSchema } from "../schemas/first-timer-schema";
import { firstTimersService } from "../services/first-timers-service";
import { requireRole, requireUser } from "@/features/auth/utils/require-role";

export interface FirstTimerActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

/**
 * FormData.get() returns `null` for a field that was never rendered
 * (e.g. Membership Decision / Heard From are hidden entirely in
 * publicMode). Our Zod schema's optional string fields expect either a
 * real string or `undefined` — never `null` — so this normalizes any
 * missing field to "" before validation. Without this, a correctly
 * filled-out public registration form fails validation with no visible
 * reason, because the *absent* fields (not the filled-in ones) are
 * what reject.
 */
function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

function parseFormData(formData: FormData) {
  return {
    full_name: str(formData, "full_name"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    gender: str(formData, "gender"),
    dob: str(formData, "dob"),
    marital_status: str(formData, "marital_status"),
    house_address: str(formData, "house_address"),
    nearest_landmark: str(formData, "nearest_landmark"),
    membership_decision: str(formData, "membership_decision"),
    life_stage: str(formData, "life_stage"),
    heard_from: str(formData, "heard_from"),
    areas_of_interest: formData.getAll("areas_of_interest").map(String),
    service_feedback: str(formData, "service_feedback"),
    service_date: str(formData, "service_date"),
  };
}

export async function createFirstTimerAction(_prev: FirstTimerActionState, formData: FormData): Promise<FirstTimerActionState> {
  const user = await requireRole(["admin", "dofficer"]);
  const parsed = firstTimerSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error) };
  }
  try {
    await firstTimersService.create(parsed.data, user.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
  revalidatePath("/first-timers");
  redirect("/first-timers");
}

export async function updateFirstTimerAction(id: string, _prev: FirstTimerActionState, formData: FormData): Promise<FirstTimerActionState> {
  await requireRole(["admin", "dofficer"]);
  const parsed = firstTimerSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error) };
  }
  try {
    await firstTimersService.update(id, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
  revalidatePath("/first-timers");
  redirect("/first-timers");
}

/** Public self-registration — no auth required, matches V1's open form. */
export async function publicRegisterAction(_prev: FirstTimerActionState, formData: FormData): Promise<FirstTimerActionState & { success?: boolean }> {
  const parsed = firstTimerSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flatten(parsed.error) };
  }
  try {
    await firstTimersService.create(parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong. Please try again." };
  }
  return { error: null, success: true };
}

export async function checkDupesAction(phone: string, excludeId?: string) {
  await requireUser();
  return firstTimersService.findDupesByPhone(phone, excludeId);
}

function flatten(error: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function exportFirstTimersCsvAction(query: { search?: string; dateFrom?: string; dateTo?: string }) {
  await requireRole(["admin", "dofficer", "experienceadmin"]);
  const { rows } = await firstTimersService.list({ ...query, page: 1, pageSize: 5000 });
  const headers = ["full_name", "phone", "email", "gender", "service_date", "membership_decision", "life_stage"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => csvEscape(String((r as Record<string, unknown>)[h] ?? ""))).join(","));
  }
  return lines.join("\r\n");
}

export async function bulkImportFirstTimersAction(rows: import("../schemas/first-timer-schema").FirstTimerInput[]) {
  const user = await requireRole(["admin", "dofficer"]);
  return firstTimersService.bulkImport(rows, user.id);
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
