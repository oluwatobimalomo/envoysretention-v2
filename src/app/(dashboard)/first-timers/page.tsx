import { requireRole } from "@/features/auth/utils/require-role";
import { firstTimersService } from "@/features/first-timers/services/first-timers-service";
import { FirstTimersToolbar } from "@/features/first-timers/components/first-timers-toolbar";
import { FirstTimersTable } from "@/features/first-timers/components/first-timers-table";
import { TablePagination } from "@/features/first-timers/components/pagination";

export const metadata = { title: "First-Timers" };

const PAGE_SIZE = 20;

export default async function FirstTimersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string; page?: string }>;
}) {
  const user = await requireRole(["admin", "dofficer", "experienceadmin", "expteam", "soulcareadmin", "soulcareteam"]);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const { rows, total } = await firstTimersService.list({
    search: sp.q,
    dateFrom: sp.from,
    dateTo: sp.to,
    page,
    pageSize: PAGE_SIZE,
  });

  const canManage = user.role === "admin" || user.role === "dofficer";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">First-Timers</h1>
        <p className="text-sm text-muted-foreground">{total} record{total !== 1 ? "s" : ""} total</p>
      </div>
      <FirstTimersToolbar canManage={canManage} />
      <FirstTimersTable rows={rows} canManage={canManage} />
      <TablePagination page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
