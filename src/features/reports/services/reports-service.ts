import "server-only";
import { createClient } from "@/lib/supabase/server";
import { normaliseStatus } from "@/features/call-pipeline/constants";

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
}

export interface DonutSlice { name: string; value: number; }
export interface BarDatum { name: string; value: number; }
export interface TrendPoint { week: string; reached: number; notReached: number; callback: number; }
export interface GoldenEnvoy { id: string; full_name: string; phone: string; submitted_at: string; connect_center: string | null; }
export interface CallerStat { name: string; total: number; reached: number; }

export interface ReportStats {
  totalFirstTimers: number;
  genderDonut: DonutSlice[];
  lifeStageBars: BarDatum[];
  areasOfInterestBars: BarDatum[];

  totalCalls: number;
  callOutcomeBars: BarDatum[];
  experienceRatingBars: BarDatum[];
  returningBars: BarDatum[];
  weeklyTrend: TrendPoint[];
  callerLeaderboard: CallerStat[];
  flaggedCount: number;

  totalOverviews: number;
  recommendedCount: number;
  conversionPct: number;
  decisionDonut: DonutSlice[];
  goldenEnvoys: GoldenEnvoy[];
}

/** Powers both /reports and /experience/dashboard — one aggregation pass
 *  over first_timers, call_feedback, and pipeline_overviews, all
 *  respecting the same date-range filter (matches V1's Report component). */
export async function getReportStats({ dateFrom, dateTo }: ReportFilters): Promise<ReportStats> {
  const supabase = await createClient();

  let ftQuery = supabase.from("first_timers").select("id, gender, life_stage, areas_of_interest, service_date");
  if (dateFrom) ftQuery = ftQuery.gte("service_date", dateFrom);
  if (dateTo) ftQuery = ftQuery.lte("service_date", dateTo);

  let fbQuery = supabase.from("call_feedback").select("call_status, experience_rating, returning, caller_name, flagged_for_pastoral, created_at");
  if (dateFrom) fbQuery = fbQuery.gte("created_at", dateFrom);
  if (dateTo) fbQuery = fbQuery.lte("created_at", `${dateTo}T23:59:59`);

  let ovQuery = supabase.from("pipeline_overviews").select("id, first_timer_id, move_to_membership, connect_center, submitted_at, first_timers(full_name, phone)");
  if (dateFrom) ovQuery = ovQuery.gte("submitted_at", dateFrom);
  if (dateTo) ovQuery = ovQuery.lte("submitted_at", `${dateTo}T23:59:59`);

  const [{ data: ft }, { data: fb }, { data: ov }] = await Promise.all([ftQuery, fbQuery, ovQuery]);

  const firstTimers = ft ?? [];
  const feedback = fb ?? [];
  type OverviewRow = { id: string; first_timer_id: string; move_to_membership: boolean; connect_center: string | null; submitted_at: string; first_timers: { full_name: string; phone: string } | null };
  const overviews = (ov ?? []) as unknown as OverviewRow[];

  // --- First-Timers breakdown ---
  const genderCounts: Record<string, number> = {};
  const lifeStageCounts: Record<string, number> = {};
  const areaCounts: Record<string, number> = {};
  for (const r of firstTimers) {
    genderCounts[r.gender ?? "Unspecified"] = (genderCounts[r.gender ?? "Unspecified"] ?? 0) + 1;
    if (r.life_stage) lifeStageCounts[r.life_stage] = (lifeStageCounts[r.life_stage] ?? 0) + 1;
    for (const a of r.areas_of_interest ?? []) areaCounts[a] = (areaCounts[a] ?? 0) + 1;
  }

  // --- Call outcomes ---
  const outcomeCounts: Record<string, number> = { Reached: 0, "Call Back": 0, "Incorrect Contact": 0 };
  const ratingCounts: Record<string, number> = {};
  const returningCounts: Record<string, number> = {};
  const callerMap = new Map<string, { total: number; reached: number }>();
  const weekMap = new Map<string, { reached: number; notReached: number; callback: number }>();
  let flaggedCount = 0;

  for (const r of feedback) {
    const norm = normaliseStatus(r.call_status) ?? "Call Back";
    outcomeCounts[norm] = (outcomeCounts[norm] ?? 0) + 1;
    if (r.experience_rating) ratingCounts[r.experience_rating] = (ratingCounts[r.experience_rating] ?? 0) + 1;
    if (r.returning) returningCounts[r.returning] = (returningCounts[r.returning] ?? 0) + 1;
    if (r.flagged_for_pastoral) flaggedCount++;

    const caller = r.caller_name || "Unknown";
    const c = callerMap.get(caller) ?? { total: 0, reached: 0 };
    c.total++;
    if (norm === "Reached") c.reached++;
    callerMap.set(caller, c);

    const weekStart = startOfWeek(r.created_at);
    const w = weekMap.get(weekStart) ?? { reached: 0, notReached: 0, callback: 0 };
    if (norm === "Reached") w.reached++;
    else if (norm === "Incorrect Contact") w.notReached++;
    else w.callback++;
    weekMap.set(weekStart, w);
  }

  const weeklyTrend = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, v]) => ({ week, ...v }));

  const callerLeaderboard = Array.from(callerMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // --- VIP Retention Overviews ---
  const totalOverviews = overviews.length;
  const recommendedCount = overviews.filter((o) => o.move_to_membership).length;
  const conversionPct = totalOverviews > 0 ? Math.round((recommendedCount / totalOverviews) * 100) : 0;

  const goldenEnvoys: GoldenEnvoy[] = overviews
    .filter((o) => o.move_to_membership)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
    .slice(0, 50)
    .map((o) => ({
      id: o.id,
      full_name: o.first_timers?.full_name ?? "—",
      phone: o.first_timers?.phone ?? "",
      submitted_at: o.submitted_at,
      connect_center: o.connect_center,
    }));

  const toBars = (counts: Record<string, number>): BarDatum[] => Object.entries(counts).map(([name, value]) => ({ name, value }));
  const toDonut = (counts: Record<string, number>): DonutSlice[] => Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  return {
    totalFirstTimers: firstTimers.length,
    genderDonut: toDonut(genderCounts),
    lifeStageBars: toBars(lifeStageCounts),
    areasOfInterestBars: toBars(areaCounts).sort((a, b) => b.value - a.value).slice(0, 8),

    totalCalls: feedback.length,
    callOutcomeBars: toBars(outcomeCounts),
    experienceRatingBars: toBars(ratingCounts),
    returningBars: toBars(returningCounts),
    weeklyTrend,
    callerLeaderboard,
    flaggedCount,

    totalOverviews,
    recommendedCount,
    conversionPct,
    decisionDonut: toDonut({ Recommended: recommendedCount, "Not Recommended": totalOverviews - recommendedCount }),
    goldenEnvoys,
  };
}

function startOfWeek(iso: string): string {
  const d = new Date(iso);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}
