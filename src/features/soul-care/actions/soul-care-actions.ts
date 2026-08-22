"use server";

import { revalidatePath } from "next/cache";
import { visitSchema, newContactSchema } from "../schemas/visit-schema";
import { soulCareService } from "../services/soul-care-service";
import { requireRole, requireUser } from "@/features/auth/utils/require-role";

export interface SoulCareActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

export async function assignContactAction(contactId: string, assignedTo: string) {
  const user = await requireRole(["admin", "soulcareadmin"]);
  await soulCareService.assign(contactId, assignedTo, user.id);
  revalidatePath("/soul-care/assign");
}

export async function unassignContactAction(contactId: string) {
  await requireRole(["admin", "soulcareadmin"]);
  await soulCareService.unassign(contactId);
  revalidatePath("/soul-care/assign");
}

export async function searchContactsAction(query: string) {
  await requireUser();
  return soulCareService.searchByNameOrPhone(query);
}

export async function createContactAction(_prev: SoulCareActionState, formData: FormData): Promise<SoulCareActionState & { contactId?: string }> {
  await requireRole(["admin", "soulcareadmin", "soulcareteam"]);
  const parsed = newContactSchema.safeParse({
    full_name: str(formData, "full_name"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    gender: str(formData, "gender"),
    marital_status: str(formData, "marital_status"),
    life_stage: str(formData, "life_stage"),
    dob: str(formData, "dob"),
    house_address: str(formData, "house_address"),
    nearest_landmark: str(formData, "nearest_landmark"),
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
    const contact = await soulCareService.createContact({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      gender: parsed.data.gender || null,
      marital_status: parsed.data.marital_status || null,
      life_stage: parsed.data.life_stage || null,
      dob: parsed.data.dob || null,
      house_address: parsed.data.house_address || null,
      nearest_landmark: parsed.data.nearest_landmark || null,
    });
    revalidatePath("/soul-care/visits/new");
    return { error: null, contactId: contact.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function logVisitAction(
  contactId: string,
  loggedBy: string,
  existingId: string | undefined,
  _prev: SoulCareActionState,
  formData: FormData
): Promise<SoulCareActionState & { success?: boolean }> {
  const user = await requireRole(["admin", "soulcareadmin", "soulcareteam"]);

  const parsed = visitSchema.safeParse({
    visit_type: str(formData, "visit_type"),
    urgency: str(formData, "urgency"),
    reason_for_care: str(formData, "reason_for_care"),
    visit_status: str(formData, "visit_status"),
    visit_date: str(formData, "visit_date"),
    visit_time: str(formData, "visit_time"),
    meeting_notes: str(formData, "meeting_notes"),
    visit_photo_url: str(formData, "visit_photo_url"),
    material_support: formData.get("material_support") === "on",
    material_support_notes: str(formData, "material_support_notes"),
    prayer_requests: str(formData, "prayer_requests"),
    testimony: str(formData, "testimony"),
    follow_up_required: formData.get("follow_up_required") === "on",
    next_follow_up_date: str(formData, "next_follow_up_date"),
    escalate_to_pastorate: formData.get("escalate_to_pastorate") === "on",
    escalation_reason: str(formData, "escalation_reason"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const payload = {
    visit_type: parsed.data.visit_type,
    reason_for_care: parsed.data.reason_for_care || null,
    urgency: parsed.data.urgency || null,
    visit_status: parsed.data.visit_status,
    visit_date: parsed.data.visit_date || null,
    visit_time: parsed.data.visit_time || null,
    meeting_notes: parsed.data.meeting_notes || null,
    visit_photo_url: parsed.data.visit_photo_url || null,
    material_support: parsed.data.material_support,
    material_support_notes: parsed.data.material_support ? parsed.data.material_support_notes || null : null,
    prayer_requests: parsed.data.prayer_requests || null,
    testimony: parsed.data.testimony || null,
    follow_up_required: parsed.data.follow_up_required,
    next_follow_up_date: parsed.data.follow_up_required ? parsed.data.next_follow_up_date || null : null,
    escalate_to_pastorate: parsed.data.escalate_to_pastorate,
    escalation_reason: parsed.data.escalate_to_pastorate ? parsed.data.escalation_reason || null : null,
  };

  try {
    if (existingId) {
      await soulCareService.updateVisit(existingId, payload);
    } else {
      await soulCareService.logVisit({ contact_id: contactId, logged_by: loggedBy, logged_by_id: user.id, ...payload });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }

  revalidatePath("/soul-care/my-visits");
  revalidatePath("/soul-care/flagged");
  return { error: null, success: true };
}

export async function exportSoulCareCsvAction() {
  await requireRole(["admin", "soulcareadmin", "soulcareteam"]);
  const rows = await soulCareService.listEnriched();
  const headers = ["full_name", "phone", "email", "gender", "life_stage", "is_active"];
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

export async function bulkImportContactsAction(rows: import("../schemas/visit-schema").NewContactInput[]) {
  await requireRole(["admin", "soulcareadmin"]);
  return soulCareService.bulkImportContacts(rows);
}
