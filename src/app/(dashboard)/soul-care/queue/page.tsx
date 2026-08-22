import { requireRole } from "@/features/auth/utils/require-role";
import { soulCareService } from "@/features/soul-care/services/soul-care-service";
import { scGenderTag } from "@/features/soul-care/constants";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Visit Queue" };

export default async function VisitQueuePage() {
  await requireRole(["admin", "soulcareadmin"]);
  const rows = await soulCareService.listEnriched();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Visit Queue</h1>
        <p className="text-sm text-muted-foreground">All Soul Care contacts and their assignment/visit status.</p>
      </div>
      <div className="space-y-2">
        {rows.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div>
              <p className="font-medium">{c.full_name}{scGenderTag(c.gender)}</p>
              <p className="text-xs text-muted-foreground">{c.phone} · {c.visits.length} visit{c.visits.length !== 1 ? "s" : ""} logged</p>
            </div>
            <Badge variant={c.assignment ? "secondary" : "outline"}>
              {c.assignment ? `Assigned to ${c.assignment.assignee_name ?? "—"}` : "Unassigned"}
            </Badge>
          </div>
        ))}
        {rows.length === 0 && <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">No contacts in the Soul Care pool yet.</div>}
      </div>
    </div>
  );
}
