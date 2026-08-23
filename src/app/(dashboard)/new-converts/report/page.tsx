import { requireRole } from "@/features/auth/utils/require-role";
import { newConvertsService } from "@/features/new-converts/services/new-converts-service";
import { ncComplete } from "@/features/new-converts/constants";
import { Users, GraduationCap, CheckCircle2, TrendingUp } from "lucide-react";

export const metadata = { title: "New Converts Retention" };

export default async function NewConvertsReportPage() {
  await requireRole(["admin", "dofficer", "soulcareadmin"]);
  const rows = await newConvertsService.listEnriched();

  const total = rows.length;
  const newSalvation = rows.filter((r) => r.conversion_type === "New Salvation").length;
  const rededication = rows.filter((r) => r.conversion_type === "Rededication").length;
  const trackComplete = rows.filter((r) => ncComplete(r.fbRows)).length;
  const trainingComplete = rows.filter((r) => r.envoys_training_completed).length;
  const retentionRate = total > 0 ? Math.round((trainingComplete / total) * 100) : 0;

  const stats = [
    { label: "Total New Converts", value: total, icon: Users },
    { label: "3-Month Track Complete", value: trackComplete, icon: CheckCircle2 },
    { label: "Training Complete", value: trainingComplete, icon: GraduationCap },
    { label: "Retention Rate", value: `${retentionRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold">New Converts Retention</h1>
        <p className="text-sm text-muted-foreground">Snapshot of the current New Converts pool and follow-up progress.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-3 font-medium">By Conversion Type</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-semibold">{newSalvation}</p>
            <p className="text-sm text-muted-foreground">New Salvation</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{rededication}</p>
            <p className="text-sm text-muted-foreground">Rededication</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Full chart-based analytics (trend lines, caller leaderboard) land with the Reports &amp; Dashboards module.
      </p>
    </div>
  );
}
