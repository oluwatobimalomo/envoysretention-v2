"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckinDialog, type ExistingCheckin } from "./checkin-dialog";
import { ncGenderTag, ncComplete } from "../constants";
import { saveTrainingAction } from "../actions/new-converts-actions";
import type { EnrichedNewConvert } from "../services/new-converts-service";

export function MyNewConvertsClient({ rows, callerName }: { rows: EnrichedNewConvert[]; callerName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogTarget, setDialogTarget] = useState<{ row: EnrichedNewConvert; month: number; existing?: ExistingCheckin } | null>(null);

  const toggleTraining = (row: EnrichedNewConvert) => {
    startTransition(async () => {
      await saveTrainingAction(row.id, !row.envoys_training_completed, row.envoys_training_notes ?? "", row.training_scheduled_date ?? "", row.trainer_name ?? "");
      router.refresh();
    });
  };

  const openEditDialog = (row: EnrichedNewConvert, month: number) => {
    const fb = row.fbRows.find((f) => f.checkin_number === month);
    if (!fb) return;
    setDialogTarget({
      row, month,
      existing: { call_status: fb.call_status, notes: fb.notes, follow_up_date: fb.follow_up_date, flagged_for_pastoral: fb.flagged_for_pastoral, flag_reason: fb.flag_reason },
    });
  };

  const openLogDialog = (row: EnrichedNewConvert) => {
    const done = new Set(row.fbRows.map((f) => f.checkin_number));
    let month: number | null = null;
    for (let m = 1; m <= 3; m++) if (!done.has(m)) { month = m; break; }
    if (month === null) return;
    setDialogTarget({ row, month });
  };

  if (rows.length === 0) {
    return <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No New Converts assigned to you yet.</div>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const complete = ncComplete(row.fbRows);
        return (
          <div key={row.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{row.full_name}{ncGenderTag(row.gender)}</p>
                <p className="text-xs text-muted-foreground">{row.phone} · {row.conversion_type}</p>
              </div>
              {!complete && <Button size="sm" onClick={() => openLogDialog(row)}>Log Check-In</Button>}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {[1, 2, 3].map((m) => {
                const done = row.fbRows.some((f) => f.checkin_number === m);
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={!done}
                    onClick={() => done && openEditDialog(row, m)}
                    title={done ? `Edit Month ${m}` : `Month ${m} not logged`}
                    className={`flex size-6 items-center justify-center rounded text-[10px] font-bold transition-opacity ${done ? "bg-success text-white hover:opacity-80 cursor-pointer" : "bg-muted text-muted-foreground cursor-default"}`}
                  >
                    M{m}
                  </button>
                );
              })}
              <label className="ml-2 flex items-center gap-1.5 text-xs">
                <Checkbox checked={row.envoys_training_completed} onCheckedChange={() => toggleTraining(row)} disabled={isPending} />
                {row.envoys_training_completed ? <CheckCircle2 size={12} className="text-success" /> : <Clock size={12} className="text-warning" />}
                Training {row.envoys_training_completed ? "Complete" : "Pending"}
              </label>
            </div>
          </div>
        );
      })}

      {dialogTarget && (
        <CheckinDialog
          open
          onOpenChange={(o) => !o && setDialogTarget(null)}
          ncId={dialogTarget.row.id}
          ncName={`${dialogTarget.row.full_name}${ncGenderTag(dialogTarget.row.gender)}`}
          month={dialogTarget.month}
          callerName={callerName}
          existing={dialogTarget.existing}
          onLogged={() => { setDialogTarget(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
