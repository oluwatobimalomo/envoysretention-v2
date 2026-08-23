import { requireRole } from "@/features/auth/utils/require-role";
import { callPipelineService } from "@/features/call-pipeline/services/call-pipeline-service";
import { CallQueueClient } from "@/features/call-pipeline/components/call-queue-client";

export const metadata = { title: "Call Queue" };

export default async function CallQueuePage() {
  await requireRole(["admin", "experienceadmin", "expteam"]);
  const rows = await callPipelineService.listEnriched();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Call Queue</h1>
        <p className="text-sm text-muted-foreground">Every first-timer in the call pipeline, by status.</p>
      </div>
      <CallQueueClient rows={rows} />
    </div>
  );
}
