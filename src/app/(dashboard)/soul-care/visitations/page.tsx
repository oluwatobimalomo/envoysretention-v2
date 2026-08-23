import { requireRole } from "@/features/auth/utils/require-role";
import { listAllVisitations } from "@/features/soul-care/services/soul-care-service";
import { VisitationsClient } from "@/features/soul-care/components/visitations-client";

export const metadata = { title: "Visitations" };

export default async function VisitationsPage() {
  await requireRole(["admin"]);
  const rows = await listAllVisitations();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Visitations</h1>
        <p className="text-sm text-muted-foreground">{rows.length} visit{rows.length !== 1 ? "s" : ""} logged across the whole Soul Care team.</p>
      </div>
      <VisitationsClient rows={rows} />
    </div>
  );
}
