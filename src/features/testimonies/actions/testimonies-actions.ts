"use server";

import { publicTestimonySchema } from "../schemas/testimony-schema";
import { testimoniesService } from "../services/testimonies-service";
import { requireRole } from "@/features/auth/utils/require-role";

export interface TestimonyActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

export async function submitPublicTestimonyAction(
  _prev: TestimonyActionState,
  formData: FormData
): Promise<TestimonyActionState & { success?: boolean }> {
  const parsed = publicTestimonySchema.safeParse({
    name: str(formData, "name"),
    category: str(formData, "category") || "General Testimony",
    testimony: str(formData, "testimony"),
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
    await testimoniesService.submitPublic({ name: parsed.data.name || null, category: parsed.data.category, testimony: parsed.data.testimony });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong. Please try again." };
  }
  return { error: null, success: true };
}

export async function exportTestimoniesCsvAction(entries: { display_name: string; date: string; testimony: string }[]) {
  await requireRole(["admin", "testimonyteam", "soulcareadmin"]);
  const headers = ["display_name", "date", "testimony"];
  const esc = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [headers.join(",")];
  for (const e of entries) lines.push([esc(e.display_name), esc(e.date), esc(e.testimony)].join(","));
  return lines.join("\r\n");
}
