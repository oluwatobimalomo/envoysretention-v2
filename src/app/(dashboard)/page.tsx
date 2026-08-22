import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/utils/require-role";
import { DEFAULT_ROUTE } from "@/lib/config/roles";
export default async function DashboardIndexPage() {
  const user = await requireUser();
  redirect(DEFAULT_ROUTE[user.role]);
}
