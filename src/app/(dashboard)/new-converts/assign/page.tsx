import { requireRole } from "@/features/auth/utils/require-role";
import { newConvertsService } from "@/features/new-converts/services/new-converts-service";
import { getTeamMembersByRole } from "@/lib/data/team-members";
import { AssignNcClient } from "@/features/new-converts/components/assign-nc-client";

export const metadata = { title: "Assign New Converts" };

export default async function AssignNewConvertsPage() {
  await requireRole(["admin", "soulcareadmin"]);
  const [rows, teamMembers] = await Promise.all([
    newConvertsService.listEnriched(),
    getTeamMembersByRole("soulcareteam"),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Assign New Converts</h1>
        <p className="text-sm text-muted-foreground">Assign New Converts to the Soul Care team for their 3-month follow-up.</p>
      </div>
      <AssignNcClient rows={rows} teamMembers={teamMembers} />
    </div>
  );
}
