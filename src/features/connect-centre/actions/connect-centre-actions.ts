"use server";

import { revalidatePath } from "next/cache";
import { connectCentreService } from "../services/connect-centre-service";
import { requireRole } from "@/features/auth/utils/require-role";

export async function toggleConfirmedAction(id: string, confirmed: boolean) {
  const user = await requireRole(["admin", "connectcentre"]);
  await connectCentreService.setConfirmed(id, confirmed, user.id);
  revalidatePath("/connect-centre");
}

export async function exportProspectsCsvAction(rows: {
  full_name: string; phone: string | null; gender: string | null; dob: string | null;
  life_stage: string | null; connect_center: string; natural_groups: string[] | null;
  confirmed: boolean; confirmed_by: string | null; confirmed_at: string | null; created_at: string;
}[]) {
  await requireRole(["admin", "connectcentre"]);
  const headers = ["full_name", "phone", "gender", "dob", "life_stage", "connect_center", "natural_groups", "confirmed", "confirmed_at", "created_at"];
  const esc = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push([
      esc(r.full_name), esc(r.phone ?? ""), esc(r.gender ?? ""), esc(r.dob ?? ""), esc(r.life_stage ?? ""),
      esc(r.connect_center), esc((r.natural_groups ?? []).join("; ")), esc(r.confirmed ? "Yes" : "No"),
      esc(r.confirmed_at?.slice(0, 10) ?? ""), esc(r.created_at.slice(0, 10)),
    ].join(","));
  }
  return lines.join("\r\n");
}
