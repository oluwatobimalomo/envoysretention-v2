import { requireRole } from "@/features/auth/utils/require-role";
import { newConvertsService } from "@/features/new-converts/services/new-converts-service";
import { RegistryToolbar } from "@/features/new-converts/components/registry-toolbar";
import { RegistryTable } from "@/features/new-converts/components/registry-table";

export const metadata = { title: "New Converts Registry" };

export default async function NewConvertsRegistryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  const user = await requireRole(["admin", "dofficer", "soulcareadmin", "soulcareteam"]);
  const sp = await searchParams;
  const { rows, total } = await newConvertsService.list({ search: sp.q, dateFrom: sp.from, dateTo: sp.to });
  const canManage = user.role === "admin" || user.role === "dofficer" || user.role === "soulcareadmin";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">New Converts Registry</h1>
        <p className="text-sm text-muted-foreground">{total} record{total !== 1 ? "s" : ""} total</p>
      </div>
      <RegistryToolbar canManage={canManage} />
      <RegistryTable rows={rows} />
    </div>
  );
}
