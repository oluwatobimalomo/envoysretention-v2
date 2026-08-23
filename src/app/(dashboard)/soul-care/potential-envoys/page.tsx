import { requireRole } from "@/features/auth/utils/require-role";
import { potentialEnvoysService } from "@/features/potential-envoys/services/potential-envoys-service";
import { getTeamMembersByRole } from "@/lib/data/team-members";
import { AssignPeClient } from "@/features/potential-envoys/components/assign-pe-client";

export const metadata = { title: "Potential Envoys" };

export default async function PotentialEnvoysPage() {
  await requireRole(["admin", "experienceadmin", "soulcareadmin"]);
  const [rows, teamMembers] = await Promise.all([
    potentialEnvoysService.listEnriched(),
    getTeamMembersByRole("soulcareteam"),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Potential Envoys</h1>
        <p className="text-sm text-muted-foreground">The 5-week track for people recommended for Membership.</p>
      </div>
      <AssignPeClient rows={rows} teamMembers={teamMembers} />
    </div>
  );
}
