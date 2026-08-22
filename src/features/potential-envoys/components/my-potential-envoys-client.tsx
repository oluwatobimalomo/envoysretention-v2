"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PeLogFeedbackDialog } from "./pe-log-feedback-dialog";
import { peNextWeek, peComplete } from "../constants";
import { saveTrainingAction, promotePeAction } from "../actions/pe-actions";
import { genderTag } from "@/features/call-pipeline/constants";
import type { EnrichedPotentialEnvoy } from "../services/potential-envoys-service";

export function MyPotentialEnvoysClient({ rows, callerName }: { rows: EnrichedPotentialEnvoy[]; callerName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogTarget, setDialogTarget] = useState<{ row: EnrichedPotentialEnvoy; week: number } | null>(null);

  const toggleTraining = (row: EnrichedPotentialEnvoy) => {
    startTransition(async () => {
      await saveTrainingAction(row.id, !row.training_completed, row.training_notes ?? "");
      router.refresh();
    });
  };

  const promote = (row: EnrichedPotentialEnvoy) => {
    startTransition(async () => {
      await promotePeAction(row.id);
      toast.success(`${row.full_name} promoted to Membership!`);
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No Potential Envoys assigned to you yet.</div>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const week = peNextWeek(row.fbRows);
        const complete = peComplete(row.fbRows);
        return (
          <div key={row.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{row.full_name}{genderTag(row.gender)}</p>
                <p className="text-xs text-muted-foreground">{row.phone}</p>
              </div>
              {row.promoted_to_membership ? (
                <Badge variant="success"><GraduationCap size={11} /> Graduated</Badge>
              ) : week !== null ? (
                <Button size="sm" onClick={() => setDialogTarget({ row, week })}>Log Week {week}</Button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((w) => {
                const done = row.fbRows.some((f) => f.week_number === w);
                return (
                  <span key={w} className={`flex size-6 items-center justify-center rounded text-[10px] font-bold ${done ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>
                    W{w}
                  </span>
                );
              })}
              <label className="ml-2 flex items-center gap-1.5 text-xs">
                <Checkbox checked={row.training_completed} onCheckedChange={() => toggleTraining(row)} disabled={isPending} />
                {row.training_completed ? <CheckCircle2 size={12} className="text-success" /> : <Clock size={12} className="text-warning" />}
                Training {row.training_completed ? "Complete" : "Pending"}
              </label>
            </div>

            {complete && row.training_completed && !row.promoted_to_membership && (
              <Button size="sm" variant="gold" className="mt-3" onClick={() => promote(row)} disabled={isPending}>
                <GraduationCap size={13} /> Promote to Membership
              </Button>
            )}
          </div>
        );
      })}

      {dialogTarget && (
        <PeLogFeedbackDialog
          open
          onOpenChange={(o) => !o && setDialogTarget(null)}
          peId={dialogTarget.row.id}
          peName={`${dialogTarget.row.full_name}${genderTag(dialogTarget.row.gender)}`}
          week={dialogTarget.week}
          callerName={callerName}
          onLogged={() => { setDialogTarget(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
