"use server";

import { revalidatePath } from "next/cache";
import { vipContactService } from "../services/vip-contact-service";
import { requireRole } from "@/features/auth/utils/require-role";

export async function assignVipAction(firstTimerId: string, assignedTo: string) {
  const user = await requireRole(["admin", "dofficer", "experienceadmin"]);
  await vipContactService.assign(firstTimerId, assignedTo, user.id);
  revalidatePath("/first-timers/vip-contact");
}

export async function unassignVipAction(firstTimerId: string) {
  await requireRole(["admin", "dofficer", "experienceadmin"]);
  await vipContactService.unassign(firstTimerId);
  revalidatePath("/first-timers/vip-contact");
}

export async function setVipMessagedAction(firstTimerId: string, messaged: boolean) {
  const user = await requireRole(["admin", "dofficer", "experienceadmin", "expteam"]);
  await vipContactService.setMessaged(firstTimerId, messaged, user.id);
  revalidatePath("/first-timers/vip-contact");
}

export async function exportVipContactCsvAction() {
  await requireRole(["admin", "dofficer", "experienceadmin"]);
  const rows = await vipContactService.listEnriched();
  const headers = ["full_name", "phone", "service_date", "status"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const status = r.vip?.messaged ? "Messaged" : "Not Messaged";
    lines.push([
      csvEscape(r.full_name), csvEscape(r.phone), csvEscape(r.service_date), csvEscape(status),
    ].join(","));
  }
  return lines.join("\r\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
