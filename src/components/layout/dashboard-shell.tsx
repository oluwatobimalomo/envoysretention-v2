import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import type { AppRole } from "@/lib/config/roles";
export function DashboardShell({ role, fullName, children }: { role: AppRole; fullName: string; children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <Sidebar role={role} fullName={fullName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader role={role} fullName={fullName} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
