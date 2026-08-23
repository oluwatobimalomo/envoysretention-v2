import { requireRole } from "@/features/auth/utils/require-role";
import { getReportStats } from "@/features/reports/services/reports-service";
import { ReportDateFilter } from "@/features/reports/components/report-date-filter";
import { ReportDonut, ReportBars, ReportTrend } from "@/features/reports/components/report-charts";
import { Phone, UserCheck, Flag, PhoneForwarded } from "lucide-react";

export const metadata = { title: "Experience Analytics Dashboard" };

export default async function ExperienceDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireRole(["admin", "experienceadmin"]);
  const sp = await searchParams;
  const stats = await getReportStats({ dateFrom: sp.from, dateTo: sp.to });

  const stat = [
    { label: "Calls Logged", value: stats.totalCalls, icon: Phone },
    { label: "Overviews Submitted", value: stats.totalOverviews, icon: PhoneForwarded },
    { label: "Conversion Rate", value: `${stats.conversionPct}%`, icon: UserCheck },
    { label: "Flagged", value: stats.flaggedCount, icon: Flag, warn: stats.flaggedCount > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Experience Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">How the 3-week call pipeline is performing.</p>
        </div>
        <ReportDateFilter />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stat.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${s.warn ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}><s.icon size={15} /></div>
            <p className="font-display text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-medium">VIP Decision Split</h2>
          <ReportDonut data={stats.decisionDonut} centerValue={stats.totalOverviews} centerLabel="Overviews Submitted" />
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-medium">Call Outcomes</h2>
          <ReportBars data={stats.callOutcomeBars} />
        </div>

        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="mb-3 font-display font-medium">Weekly Call Activity</h2>
          <ReportTrend data={stats.weeklyTrend} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-medium">Caller Leaderboard</h2>
          {stats.callerLeaderboard.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No calls logged yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.callerLeaderboard.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.reached}/{c.total} reached ({Math.round((c.reached / c.total) * 100)}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-medium">Returning Likelihood</h2>
          <ReportBars data={stats.returningBars} height={200} />
        </div>
      </div>
    </div>
  );
}
