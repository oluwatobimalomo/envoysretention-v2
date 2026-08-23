import { requireRole } from "@/features/auth/utils/require-role";
import { callPipelineService } from "@/features/call-pipeline/services/call-pipeline-service";
import { getTeamMembersByRole } from "@/lib/data/team-members";
import { AssignCallsClient } from "@/features/call-pipeline/components/assign-calls-client";

export const metadata = { title: "Assign Calls" };

export default async function AssignCallsPage() {
  await requireRole(["admin", "experienceadmin"]);
  const [rows, teamMembers] = await Promise.all([
    callPipelineService.listEnriched(),
    getTeamMembersByRole("expteam"),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Assign Calls</h1>
        <p className="text-sm text-muted-foreground">Assign new first-timers to the Experience Team for their 3-week follow-up.</p>
      </div>
      <AssignCallsClient rows={rows} teamMembers={teamMembers} />
    </div>
  );
}
