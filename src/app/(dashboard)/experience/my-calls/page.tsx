import { requireRole } from "@/features/auth/utils/require-role";
import { callPipelineService } from "@/features/call-pipeline/services/call-pipeline-service";
import { MyCallsClient } from "@/features/call-pipeline/components/my-calls-client";

export const metadata = { title: "My Calls" };

export default async function MyCallsPage() {
  const user = await requireRole(["admin", "experienceadmin", "expteam"]);
  const all = await callPipelineService.listEnriched();
  const mine = all.filter((r) => r.assignment?.assigned_to === user.id || r.fbRows.some((f) => f.caller_id === user.id));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">My Calls</h1>
        <p className="text-sm text-muted-foreground">{mine.length} contact{mine.length !== 1 ? "s" : ""} assigned to you</p>
      </div>
      <MyCallsClient rows={mine} callerName={user.fullName} />
    </div>
  );
}
