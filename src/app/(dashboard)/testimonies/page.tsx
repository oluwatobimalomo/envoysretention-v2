import { requireRole } from "@/features/auth/utils/require-role";
import { testimoniesService } from "@/features/testimonies/services/testimonies-service";
import { TestimoniesToolbar } from "@/features/testimonies/components/testimonies-toolbar";
import { TestimonyList } from "@/features/testimonies/components/testimony-list";

export const metadata = { title: "Testimonies" };

export default async function TestimoniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  await requireRole(["admin", "testimonyteam", "soulcareadmin"]);
  const sp = await searchParams;
  const entries = await testimoniesService.listVisitTestimonies({ search: sp.q, dateFrom: sp.from, dateTo: sp.to });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Testimonies</h1>
        <p className="text-sm text-muted-foreground">{entries.length} testimon{entries.length !== 1 ? "ies" : "y"} shared during Soul Care visitations</p>
      </div>
      <TestimoniesToolbar />
      <TestimonyList entries={entries} filename={`testimonies-${new Date().toISOString().slice(0, 10)}.csv`} />
    </div>
  );
}
