"use server";

import { publicFeedbackSchema } from "../schemas/feedback-schema";
import { feedbackService } from "../services/feedback-service";
import { requireRole } from "@/features/auth/utils/require-role";

export interface FeedbackActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

export async function submitPublicFeedbackAction(
  _prev: FeedbackActionState,
  formData: FormData
): Promise<FeedbackActionState & { success?: boolean }> {
  const parsed = publicFeedbackSchema.safeParse({
    name: str(formData, "name"),
    gender: str(formData, "gender"),
    phone: str(formData, "phone"),
    membership_status: str(formData, "membership_status"),
    focus_points: formData.getAll("focus_points").map(String),
    feedback: str(formData, "feedback"),
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
    await feedbackService.submitPublic({
      name: parsed.data.name || null,
      gender: parsed.data.gender || null,
      phone: parsed.data.phone || null,
      membership_status: parsed.data.membership_status,
      focus_points: parsed.data.focus_points,
      feedback: parsed.data.feedback,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong. Please try again." };
  }
  return { error: null, success: true };
}

export async function exportFeedbackCsvAction(entries: { display_name: string; date: string; source: string; feedback: string }[]) {
  await requireRole(["admin", "experienceadmin", "research"]);
  const headers = ["display_name", "date", "source", "feedback"];
  const esc = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [headers.join(",")];
  for (const e of entries) lines.push([esc(e.display_name), esc(e.date), esc(e.source), esc(e.feedback)].join(","));
  return lines.join("\r\n");
}
