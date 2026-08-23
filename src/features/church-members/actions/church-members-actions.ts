"use server";

import { revalidatePath } from "next/cache";
import { churchMembersService } from "../services/church-members-service";
import { requireRole } from "@/features/auth/utils/require-role";
import type { ChurchMemberRow } from "../services/church-members-service";

export async function setMemberStatusAction(id: string, status: string) {
  await requireRole(["admin", "soulcareadmin"]);
  await churchMembersService.setStatus(id, status);
  revalidatePath("/soul-care/steward-care");
  revalidatePath("/soul-care/members-care");
  revalidatePath("/soul-care/priority");
}

export async function addMemberToPoolAction(member: ChurchMemberRow) {
  await requireRole(["admin", "soulcareadmin", "soulcareteam"]);
  await churchMembersService.addToPool(member);
  revalidatePath("/soul-care/steward-care");
  revalidatePath("/soul-care/members-care");
  revalidatePath("/soul-care/assign");
}

export async function bulkImportMembersAction(rows: {
  full_name: string; phone: string; email: string | null; gender: string | null; dob: string | null;
  marital_status: string | null; life_stage: string | null; category: string; membership_status: string;
  house_address: string | null; nearest_landmark: string | null;
}[]) {
  const user = await requireRole(["admin", "soulcareadmin"]);
  const payload = rows.map((r) => ({ ...r, added_by: user.id }));
  return churchMembersService.bulkImport(payload as never);
}
