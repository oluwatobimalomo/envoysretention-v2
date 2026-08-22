"use server";

import { revalidatePath } from "next/cache";
import { vipContactService } from "../services/vip-contact-service";
import { requireRole } from "@/features/auth/utils/require-role";

export async function assignVipAction(firstTimerId: string, assignedTo: string) {
  const user = await requireRole(["admin", "dofficer", "experienceadmin"]);
  await vipContactService.assign(firstTimerId, assignedTo, user.id);
  revalidatePath("/first-timers/vip-contact");
}

export async function setVipMessagedAction(firstTimerId: string, messaged: boolean) {
  const user = await requireRole(["admin", "dofficer", "experienceadmin", "expteam"]);
  await vipContactService.setMessaged(firstTimerId, messaged, user.id);
  revalidatePath("/first-timers/vip-contact");
}
