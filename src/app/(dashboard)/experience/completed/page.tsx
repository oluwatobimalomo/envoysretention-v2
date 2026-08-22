import { requireRole } from "@/features/auth/utils/require-role";
import { callPipelineService } from "@/features/call-pipeline/services/call-pipeline-service";
import { genderTag } from "@/features/call-pipeline/constants";
import { CompletedToolbar } from "@/features/call-pipeline/components/completed-toolbar";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Completed Pipelines" };

export default async function CompletedPipelinesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["admin", "experienceadmin"]);
  const sp = await searchParams;
  const rows = await callPipelineService.listCompleted({ search: sp.q });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Completed Pipelines</h1>
        <p className="text-sm text-muted-foreground">{rows.length} VIP Retention Overview{rows.length !== 1 ? "s" : ""} submitted</p>
      </div>

      <CompletedToolbar />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">No completed pipelines yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">VIP Name</th>
                <th className="px-4 py-3 font-medium">Submitted By</th>
                <th className="px-4 py-3 font-medium">Decision</th>
                <th className="px-4 py-3 font-medium">Connect Center</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const ft = r.first_timers;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium">{ft?.full_name ?? "—"}{genderTag(ft?.gender)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.submitted_by}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.move_to_membership ? "success" : "outline"}>
                        {r.move_to_membership ? "Recommended" : "Not Recommended"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.connect_center ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.submitted_at?.slice(0, 10)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
