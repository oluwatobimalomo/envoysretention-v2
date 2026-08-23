"use server";

import { requireRole } from "@/features/auth/utils/require-role";
import type { GoldenEnvoy } from "../services/reports-service";

export async function exportGoldenEnvoysCsvAction(rows: GoldenEnvoy[]) {
  await requireRole(["admin", "experienceadmin", "soulcareadmin"]);
  const esc = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
  const headers = ["full_name", "phone", "connect_center", "submitted_at"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push([esc(r.full_name), esc(r.phone), esc(r.connect_center ?? ""), esc(r.submitted_at.slice(0, 10))].join(","));
  }
  return lines.join("\r\n");
}
