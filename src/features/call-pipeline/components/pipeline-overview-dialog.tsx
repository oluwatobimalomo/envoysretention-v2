"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitPipelineOverviewAction, type CallPipelineActionState } from "../actions/call-pipeline-actions";
import { CONNECT_CENTERS, NATURAL_GROUPS } from "../constants";
import { cn } from "@/lib/utils";

const initialState: CallPipelineActionState & { success?: boolean } = { error: null };

export function PipelineOverviewDialog({
  open,
  onOpenChange,
  firstTimerId,
  firstTimerName,
  submittedBy,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firstTimerId: string;
  firstTimerName: string;
  submittedBy: string;
  onDone: () => void;
}) {
  const action = submitPipelineOverviewAction.bind(null, firstTimerId, submittedBy);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    if (state.success) {
      toast.success("VIP Retention Overview submitted.");
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileText size={16} /> VIP Retention Overview — {firstTimerName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Move to Membership? <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <label className="flex flex-1 items-center justify-center gap-2 rounded-md border p-2.5 text-sm font-medium has-[:checked]:border-success has-[:checked]:bg-success/10 has-[:checked]:text-success cursor-pointer">
                <input type="radio" name="move_to_membership" value="true" className="sr-only" required /> Yes
              </label>
              <label className="flex flex-1 items-center justify-center gap-2 rounded-md border p-2.5 text-sm font-medium has-[:checked]:border-warning has-[:checked]:bg-warning/10 has-[:checked]:text-warning cursor-pointer">
                <input type="radio" name="move_to_membership" value="false" className="sr-only" /> No
              </label>
            </div>
            {state.fieldErrors?.move_to_membership && <p className="text-xs text-destructive">{state.fieldErrors.move_to_membership}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Natural Groups</Label>
            <div className="flex flex-wrap gap-2">
              {NATURAL_GROUPS.map((g) => {
                const on = groups.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroups((prev) => (on ? prev.filter((x) => x !== g) : [...prev, g]))}
                    className={cn(
                      "rounded-full border-2 px-4 py-1.5 text-sm transition-colors",
                      on ? "border-primary bg-accent text-primary font-semibold" : "border-input text-muted-foreground"
                    )}
                  >
                    {on ? "✓ " : ""}{g}
                  </button>
                );
              })}
            </div>
            {groups.map((g) => <input key={g} type="hidden" name="natural_groups" value={g} />)}
          </div>

          <div className="space-y-1.5">
            <Label>Recommended Connect Center</Label>
            <NativeSelect name="connect_center" defaultValue="">
              <option value="">Select the closest Connect Center</option>
              {CONNECT_CENTERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </div>

          <div className="space-y-1.5">
            <Label>Overview Notes</Label>
            <Textarea name="overview_notes" rows={3} placeholder="Any observations or context to share with the pastoral team…" />
          </div>

          {state.error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-full" variant="gold">
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Saving…" : <><CheckCircle2 size={14} /> Submit VIP Retention Overview</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
