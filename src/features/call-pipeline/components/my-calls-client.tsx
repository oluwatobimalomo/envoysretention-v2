"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, CheckCircle2, RefreshCw, Flag, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogFeedbackDialog, type ExistingWeekFeedback } from "./log-feedback-dialog";
import { genderTag, nextWeek, normaliseStatus, pipelineComplete, weeksLogged, type WeekRow } from "../constants";
import type { EnrichedFirstTimer } from "../services/call-pipeline-service";
import { cn } from "@/lib/utils";

const TABS = [
  { k: "all", label: "All" },
  { k: "reached", label: "Reached" },
  { k: "callback", label: "Call Back" },
  { k: "complete", label: "Complete" },
  { k: "flagged", label: "Flagged" },
] as const;

export function MyCallsClient({ rows, callerName }: { rows: EnrichedFirstTimer[]; callerName: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof TABS)[number]["k"]>("all");
  const [dialogTarget, setDialogTarget] = useState<{ row: EnrichedFirstTimer; week: number; existing?: ExistingWeekFeedback } | null>(null);

  const reached = rows.filter((r) => r.fbRows.some((f) => normaliseStatus(f.call_status) === "Reached"));
  const callback = rows.filter((r) => {
    const last = r.fbRows[r.fbRows.length - 1];
    return last && normaliseStatus(last.call_status) === "Call Back";
  });
  const complete = rows.filter((r) => pipelineComplete(r.fbRows));
  const flagged = rows.filter((r) => r.fbRows.some((f) => f.flagged_for_pastoral));

  const views = { all: rows, reached, callback, complete, flagged };
  const filtered = views[filter];

  const dueToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return rows
      .filter((r) => !pipelineComplete(r.fbRows))
      .map((r) => {
        const last = r.fbRows[r.fbRows.length - 1];
        if (!last?.follow_up_date || last.follow_up_date > today) return null;
        return { row: r, dueDate: last.follow_up_date };
      })
      .filter((x): x is { row: EnrichedFirstTimer; dueDate: string } => x !== null)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [rows]);

  const openLogDialog = (row: EnrichedFirstTimer) => {
    const week = nextWeek(row.fbRows as WeekRow[]);
    if (week === null) return;
    setDialogTarget({ row, week });
  };

  const openEditDialog = (row: EnrichedFirstTimer, week: number) => {
    const fb = row.fbRows.find((f) => f.week_number === week);
    if (!fb) return;
    setDialogTarget({
      row,
      week,
      existing: {
        call_status: fb.call_status,
        experience_rating: fb.experience_rating,
        returning: fb.returning,
        notes: fb.notes,
        follow_up_date: fb.follow_up_date,
        church_attendance: fb.church_attendance,
        flagged_for_pastoral: fb.flagged_for_pastoral,
        flag_reason: fb.flag_reason,
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Assigned to Me" value={rows.length} icon={Phone} />
        <StatCard label="Pipeline Complete" value={complete.length} icon={CheckCircle2} />
        <StatCard label="Call Backs" value={callback.length} icon={RefreshCw} />
        <StatCard label="Flagged" value={flagged.length} icon={Flag} accent="text-destructive" />
      </div>

      {dueToday.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-warning">
            <Calendar size={14} /> Due today or overdue ({dueToday.length})
          </p>
          <div className="space-y-1.5">
            {dueToday.map(({ row, dueDate }) => (
              <div key={row.id} className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm">
                <span>{row.full_name}{genderTag(row.gender)} <span className="text-muted-foreground">· due {dueDate}</span></span>
                <Button size="sm" variant="outline" onClick={() => openLogDialog(row)}>Log Call</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.k}
            onClick={() => setFilter(t.k)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === t.k ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-accent"
            )}
          >
            {t.label} ({views[t.k].length})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">Nothing in this category.</div>
        )}
        {filtered.map((row) => {
          const week = nextWeek(row.fbRows as WeekRow[]);
          return (
            <div key={row.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.full_name}{genderTag(row.gender)}</p>
                  <p className="text-xs text-muted-foreground">{row.phone} · Service {row.service_date}</p>
                </div>
                {week !== null ? (
                  <Button size="sm" onClick={() => openLogDialog(row)}>Log Week {week}</Button>
                ) : !row.overview ? (
                  <Button size="sm" variant="gold" onClick={() => openLogDialog(row)}>Submit Overview</Button>
                ) : (
                  <Badge variant="success">Overview submitted</Badge>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {[1, 2, 3].map((w) => {
                  const logged = weeksLogged(row.fbRows as WeekRow[]).has(w);
                  return (
                    <button
                      key={w}
                      type="button"
                      disabled={!logged}
                      onClick={() => logged && openEditDialog(row, w)}
                      className={cn(
                        "flex size-6 items-center justify-center rounded text-[10px] font-bold transition-opacity",
                        logged ? "bg-success text-white hover:opacity-80 cursor-pointer" : "bg-muted text-muted-foreground cursor-default"
                      )}
                      title={logged ? `Edit Week ${w}` : `Week ${w} not logged`}
                    >
                      W{w}
                    </button>
                  );
                })}
                {pipelineComplete(row.fbRows as WeekRow[]) && (
                  <span className="ml-1 flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 size={12} /> Complete</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dialogTarget && (
        <LogFeedbackDialog
          open
          onOpenChange={(o) => !o && setDialogTarget(null)}
          firstTimerId={dialogTarget.row.id}
          firstTimerName={`${dialogTarget.row.full_name}${genderTag(dialogTarget.row.gender)}`}
          week={dialogTarget.week}
          callerName={callerName}
          hasExistingOverview={!!dialogTarget.row.overview}
          existing={dialogTarget.existing}
          onLogged={() => { setDialogTarget(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ComponentType<{ size?: number }>; accent?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className={cn("mb-2 flex size-8 items-center justify-center rounded-lg bg-accent", accent)}>
        <Icon size={15} />
      </div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
