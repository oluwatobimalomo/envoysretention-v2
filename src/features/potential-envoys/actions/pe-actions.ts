"use server";

import { revalidatePath } from "next/cache";
import { peFeedbackSchema } from "../schemas/pe-feedback-schema";
import { potentialEnvoysService } from "../services/potential-envoys-service";
import { requireRole } from "@/features/auth/utils/require-role";

export interface PeActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

export async function assignPeAction(peId: string, assignedTo: string) {
  const user = await requireRole(["admin", "experienceadmin", "soulcareadmin"]);
  await potentialEnvoysService.assign(peId, assignedTo, user.id);
  revalidatePath("/soul-care/potential-envoys");
}

export async function unassignPeAction(peId: string) {
  await requireRole(["admin", "experienceadmin", "soulcareadmin"]);
  await potentialEnvoysService.unassign(peId);
  revalidatePath("/soul-care/potential-envoys");
}

export async function bulkAssignPeAction(peIds: string[], assignedTo: string) {
  const user = await requireRole(["admin", "experienceadmin", "soulcareadmin"]);
  await potentialEnvoysService.bulkAssign(peIds, assignedTo, user.id);
  revalidatePath("/soul-care/potential-envoys");
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

export async function logPeFeedbackAction(
  peId: string,
  week: number,
  callerName: string,
  _prev: PeActionState,
  formData: FormData
): Promise<PeActionState & { success?: boolean }> {
  const user = await requireRole(["admin", "experienceadmin", "soulcareadmin", "soulcareteam"]);

  const parsed = peFeedbackSchema.safeParse({
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

  const existing = await potentialEnvoysService.getFeedbackForWeek(peId, week);
  try {
    await potentialEnvoysService.saveFeedback(
      {
        potential_envoy_id: peId,
        week_number: week,
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

  revalidatePath("/soul-care/my-potential-envoys");
  return { error: null, success: true };
}

export async function saveTrainingAction(peId: string, completed: boolean, notes: string) {
  await requireRole(["admin", "experienceadmin", "soulcareadmin", "soulcareteam"]);
  await potentialEnvoysService.saveTraining(peId, completed, notes || null);
  revalidatePath("/soul-care/my-potential-envoys");
  revalidatePath("/soul-care/potential-envoys");
}

export async function promotePeAction(peId: string) {
  await requireRole(["admin", "experienceadmin", "soulcareadmin"]);
  await potentialEnvoysService.promote(peId);
  revalidatePath("/soul-care/my-potential-envoys");
  revalidatePath("/soul-care/potential-envoys");
}

export async function exportPotentialEnvoysCsvAction() {
  await requireRole(["admin", "experienceadmin", "soulcareadmin"]);
  const rows = await potentialEnvoysService.listEnriched();
  const headers = ["full_name", "phone", "gender", "training_completed", "promoted_to_membership"];
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
