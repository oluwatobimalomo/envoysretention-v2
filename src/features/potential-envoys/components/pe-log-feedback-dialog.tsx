"use client";

import { startTransition, useActionState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, Flag } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { logPeFeedbackAction, type PeActionState } from "../actions/pe-actions";
import { CALL_STATUS_OPTIONS } from "@/features/call-pipeline/constants";

const initialState: PeActionState & { success?: boolean } = { error: null };

export interface ExistingPeWeekFeedback {
  call_status: string;
  notes: string | null;
  follow_up_date: string | null;
  flagged_for_pastoral: boolean;
  flag_reason: string | null;
}

export function PeLogFeedbackDialog({
  open, onOpenChange, peId, peName, week, callerName, existing, onLogged,
}: {
  open: boolean; onOpenChange: (open: boolean) => void; peId: string; peName: string;
  week: number; callerName: string; existing?: ExistingPeWeekFeedback; onLogged: () => void;
}) {
  const isEditMode = !!existing;
  const action = logPeFeedbackAction.bind(null, peId, week, callerName);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [flagged, setFlagged] = useState(existing?.flagged_for_pastoral ?? false);

  useEffect(() => {
    if (state.success) {
      toast.success(`Week ${week} ${isEditMode ? "updated" : "logged"} for ${peName}.`);
      onLogged();
      onOpenChange(false);
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
        <DialogHeader><DialogTitle>{isEditMode ? "Edit" : ""} Week {week} Check-In — {peName}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Call Status</Label>
            <NativeSelect name="call_status" required defaultValue={existing?.call_status ?? ""}>
              <option value="">Select status</option>
              {CALL_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </NativeSelect>
            {state.fieldErrors?.call_status && <p className="text-xs text-destructive">{state.fieldErrors.call_status}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Follow-Up Date</Label>
            <Input type="date" name="follow_up_date" defaultValue={existing?.follow_up_date ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea name="notes" rows={3} placeholder="How are they settling in?" defaultValue={existing?.notes ?? ""} />
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-destructive">
              <Checkbox checked={flagged} onCheckedChange={(c) => setFlagged(!!c)} />
              <input type="hidden" name="flagged_for_pastoral" value={flagged ? "on" : ""} />
              <Flag size={13} /> Flag for Pastoral Team
            </label>
            {flagged && <Textarea name="flag_reason" rows={2} placeholder="Reason…" defaultValue={existing?.flag_reason ?? ""} />}
          </div>
          {state.error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Saving…" : <><CheckCircle2 size={14} /> {isEditMode ? "Update" : "Save"} Week {week}</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
