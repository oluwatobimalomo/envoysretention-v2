import { requireRole } from "@/features/auth/utils/require-role";
import { envoysVisitorsService } from "@/features/envoys-visitors/services/envoys-visitors-service";
import { VisitorsClient } from "@/features/envoys-visitors/components/visitors-client";

export const metadata = { title: "Envoys Visitors" };

export default async function EnvoysVisitorsPage() {
  await requireRole(["admin", "experienceadmin"]);
  const rows = await envoysVisitorsService.list();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Envoys Visitors</h1>
        <p className="text-sm text-muted-foreground">First-timers not recommended for membership — kept for reference, export, or restoration.</p>
      </div>
      <VisitorsClient rows={rows} />
    </div>
  );
}
