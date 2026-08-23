import { requireRole } from "@/features/auth/utils/require-role";
import { feedbackService } from "@/features/feedback/services/feedback-service";
import { genderTag } from "@/features/call-pipeline/constants";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export const metadata = { title: "Flagged" };

export default async function FlaggedFeedbackPage() {
  await requireRole(["admin", "experienceadmin", "expteam"]);
  const rows = await feedbackService.listFlagged();
  const agingCount = rows.filter((r) => r.daysOpen >= 3).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Flagged for Pastoral</h1>
          <p className="text-sm text-muted-foreground">{rows.length} record{rows.length !== 1 ? "s" : ""} requiring pastoral attention</p>
        </div>
        {agingCount > 0 && <Badge variant="destructive"><AlertCircle size={11} /> {agingCount} aging 3+ days</Badge>}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">Nothing currently flagged.</div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const ft = r.first_timers;
            const aging = r.daysOpen >= 3;
            return (
              <div key={r.id} className={`rounded-xl border bg-card p-4 ${aging ? "border-l-4 border-l-destructive" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{ft?.full_name ?? "—"}{genderTag(ft?.gender)}</p>
                    <p className="text-xs text-muted-foreground">{ft?.phone} · Week {r.week_number} · {r.created_at.slice(0, 10)}</p>
                    {r.flag_reason && <p className="mt-1.5 text-sm">{r.flag_reason}</p>}
                  </div>
                  {aging && <Badge variant="destructive">{r.daysOpen} days open</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
