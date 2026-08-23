"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, CheckCircle2, RefreshCw, Flag, Calendar, MessageCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogFeedbackDialog, type ExistingWeekFeedback } from "./log-feedback-dialog";
import { genderTag, nextWeek, normaliseStatus, pipelineComplete, weeksLogged, waLink, type WeekRow } from "../constants";
import type { EnrichedFirstTimer } from "../services/call-pipeline-service";
import { cn } from "@/lib/utils";

const TABS = [
  { k: "all", label: "All" },
  { k: "reached", label: "Reached" },
  { k: "callback", label: "Call Back" },
  { k: "complete", label: "Complete" },
  { k: "flagged", label: "Flagged" },
] as const;

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

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
        <StatCard label="Assigned to Me" value={rows.length} icon={Phone} borderColor="var(--brand-green)" />
        <StatCard label="Pipeline Complete" value={complete.length} icon={CheckCircle2} borderColor="var(--brand-green)" />
        <StatCard label="Call Backs" value={callback.length} icon={RefreshCw} borderColor="var(--brand-gold)" />
        <StatCard label="Flagged" value={flagged.length} icon={Flag} accent="text-destructive" borderColor="var(--destructive)" />
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
          const logged = weeksLogged(row.fbRows as WeekRow[]);
          const complete = pipelineComplete(row.fbRows as WeekRow[]);
          const wa = waLink(row.phone);
          const lastFb = row.fbRows[row.fbRows.length - 1];
          const statusLabel = complete ? "Complete" : logged.size > 0 ? "In Progress" : "Pending";
          const statusVariant = complete ? "success" : logged.size > 0 ? "warning" : "outline";

          return (
            <div key={row.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-xs font-semibold text-brand-gold-light">
                    {initials(row.full_name)}
                  </div>
                  <div>
                    <p className="font-medium">{row.full_name}{genderTag(row.gender)}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <a href={`tel:${row.phone}`} className="text-primary hover:underline">{row.phone}</a>
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="text-success hover:opacity-70" title="Message on WhatsApp">
                          <MessageCircle size={13} />
                        </a>
                      )}
                      <span>· Service {row.service_date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={statusVariant}>{statusLabel}</Badge>
                  {week !== null ? (
                    <Button size="sm" onClick={() => openLogDialog(row)}>Log Week {week}</Button>
                  ) : !row.overview ? (
                    <Button size="sm" variant="gold" onClick={() => openLogDialog(row)}>Submit Overview</Button>
                  ) : (
                    <Badge variant="success">Overview submitted</Badge>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {[1, 2, 3].map((w) => {
                  const isLogged = logged.has(w);
                  return (
                    <button
                      key={w}
                      type="button"
                      disabled={!isLogged}
                      onClick={() => isLogged && openEditDialog(row, w)}
                      className={cn(
                        "flex size-6 items-center justify-center rounded text-[10px] font-bold transition-opacity",
                        isLogged ? "bg-success text-white hover:opacity-80 cursor-pointer" : "bg-muted text-muted-foreground cursor-default"
                      )}
                      title={isLogged ? `Edit Week ${w}` : `Week ${w} not logged`}
                    >
                      W{w}
                    </button>
                  );
                })}
                {week !== null && (
                  <span className="ml-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock size={11} /> Next: Week {week}</span>
                )}
                {complete && (
                  <span className="ml-1 flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 size={12} /> Complete</span>
                )}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {lastFb
                  ? `Last call: ${lastFb.call_status}${lastFb.notes ? ` — ${lastFb.notes}` : ""} (${lastFb.created_at.slice(0, 10)})`
                  : "No call logs yet — start with Week 1."}
              </p>
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

function StatCard({ label, value, icon: Icon, accent, borderColor }: { label: string; value: number; icon: React.ComponentType<{ size?: number }>; accent?: string; borderColor?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 border-l-4" style={{ borderLeftColor: borderColor }}>
      <div className={cn("mb-2 flex size-8 items-center justify-center rounded-lg bg-accent", accent)}>
        <Icon size={15} />
      </div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
