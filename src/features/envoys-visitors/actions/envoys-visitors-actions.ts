"use server";

import { revalidatePath } from "next/cache";
import { envoysVisitorsService } from "../services/envoys-visitors-service";
import { requireRole } from "@/features/auth/utils/require-role";

export async function restoreVisitorAction(id: string, originalFirstTimerId: string) {
  await requireRole(["admin", "experienceadmin"]);
  await envoysVisitorsService.restore(id, originalFirstTimerId);
  revalidatePath("/experience/visitors");
  revalidatePath("/experience/my-calls");
}

export async function exportVisitorsCsvAction(rows: { full_name: string; phone: string | null; natural_groups: string[] | null; moved_at: string; restored_at: string | null }[]) {
  await requireRole(["admin", "experienceadmin"]);
  const esc = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
  const headers = ["full_name", "phone", "natural_groups", "moved_at", "restored_at"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push([
      esc(r.full_name), esc(r.phone ?? ""), esc((r.natural_groups ?? []).join("; ")),
      esc(r.moved_at.slice(0, 10)), esc(r.restored_at?.slice(0, 10) ?? ""),
    ].join(","));
  }
  return lines.join("\r\n");
}
