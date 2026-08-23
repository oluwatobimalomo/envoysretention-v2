import { requireRole } from "@/features/auth/utils/require-role";
import { getReportStats } from "@/features/reports/services/reports-service";
import { ReportDateFilter } from "@/features/reports/components/report-date-filter";
import { ReportDonut, ReportBars, ReportTrend } from "@/features/reports/components/report-charts";
import { GoldenEnvoysTable } from "@/features/reports/components/golden-envoys-table";
import { Users, Phone, UserCheck, Flag } from "lucide-react";

export const metadata = { title: "Report" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireRole(["admin", "experienceadmin"]);
  const sp = await searchParams;
  const stats = await getReportStats({ dateFrom: sp.from, dateTo: sp.to });

  const stat = [
    { label: "First-Timers", value: stats.totalFirstTimers, icon: Users },
    { label: "Calls Logged", value: stats.totalCalls, icon: Phone },
    {
      label: "Conversion Rate", value: `${stats.conversionPct}%`, icon: UserCheck,
      sub: stats.totalOverviews > 0 ? `${stats.recommendedCount} of ${stats.totalOverviews} recommended` : "No overviews yet",
    },
    { label: "Flagged", value: stats.flaggedCount, icon: Flag, warn: stats.flaggedCount > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Report</h1>
          <p className="text-sm text-muted-foreground">Full retention analytics across First-Timers and the call pipeline.</p>
        </div>
        <ReportDateFilter />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stat.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${s.warn ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}><s.icon size={15} /></div>
            <p className="font-display text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            {"sub" in s && s.sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-medium">VIPs Membership Decision</h2>
          <ReportDonut data={stats.decisionDonut} centerValue={`${stats.conversionPct}%`} centerLabel="recommended for Membership" />
          <p className="mt-2 text-center text-xs text-muted-foreground">Based on the Membership Recommendation in each VIP Retention Overview.</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-medium">Call Outcomes</h2>
          <ReportBars data={stats.callOutcomeBars} />
        </div>

        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="mb-3 font-display font-medium">Weekly Call Activity</h2>
          <ReportTrend data={stats.weeklyTrend} />
        </div>

        <div className="lg:col-span-2">
          <GoldenEnvoysTable rows={stats.goldenEnvoys} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-medium">Returning Likelihood</h2>
          <ReportBars data={stats.returningBars} height={180} />
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-medium">Experience Rating</h2>
          <ReportBars data={stats.experienceRatingBars} height={180} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-medium">Gender Split</h2>
          <ReportDonut data={stats.genderDonut} centerValue={stats.totalFirstTimers} centerLabel="First-Timers" />
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

        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="mb-3 font-display font-medium">Areas of Interest</h2>
          <ReportBars data={stats.areasOfInterestBars} height={240} />
        </div>
      </div>
    </div>
  );
}
