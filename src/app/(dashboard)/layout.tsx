import type { ReactNode } from "react";
import { requireUser } from "@/features/auth/utils/require-role";
import { DashboardShell } from "@/components/layout/dashboard-shell";
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <DashboardShell role={user.role} fullName={user.fullName}>{children}</DashboardShell>;
}
