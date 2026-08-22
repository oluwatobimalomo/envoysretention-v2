import { requireRole } from "@/features/auth/utils/require-role";
import { soulCareService } from "@/features/soul-care/services/soul-care-service";
import { getTeamMembersByRole } from "@/lib/data/team-members";
import { AssignVisitsClient } from "@/features/soul-care/components/assign-visits-client";

export const metadata = { title: "Assign Visits" };

export default async function AssignVisitsPage() {
  await requireRole(["admin", "soulcareadmin"]);
  const [rows, teamMembers] = await Promise.all([
    soulCareService.listEnriched(),
    getTeamMembersByRole("soulcareteam"),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Assign Visits</h1>
        <p className="text-sm text-muted-foreground">Assign Soul Care contacts to team members for ongoing pastoral visits.</p>
      </div>
      <AssignVisitsClient rows={rows} teamMembers={teamMembers} />
    </div>
  );
}
