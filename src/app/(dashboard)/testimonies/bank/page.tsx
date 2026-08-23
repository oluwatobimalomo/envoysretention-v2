import { requireRole } from "@/features/auth/utils/require-role";
import { testimoniesService } from "@/features/testimonies/services/testimonies-service";
import { TestimonyBankToolbar } from "@/features/testimonies/components/testimony-bank-toolbar";
import { TestimonyList } from "@/features/testimonies/components/testimony-list";

export const metadata = { title: "Testimony Bank" };

export default async function TestimonyBankPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; from?: string; to?: string }>;
}) {
  await requireRole(["admin", "testimonyteam", "soulcareadmin"]);
  const sp = await searchParams;
  const entries = await testimoniesService.listBank({ search: sp.q, category: sp.category, dateFrom: sp.from, dateTo: sp.to });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Testimony Bank</h1>
        <p className="text-sm text-muted-foreground">{entries.length} testimon{entries.length !== 1 ? "ies" : "y"} submitted via the public Testimony QR</p>
      </div>
      <TestimonyBankToolbar />
      <TestimonyList entries={entries} filename={`testimony-bank-${new Date().toISOString().slice(0, 10)}.csv`} />
    </div>
  );
}
