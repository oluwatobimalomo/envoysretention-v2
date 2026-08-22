"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, Flag } from "lucide-react";
import { toast } from "sonner";
import { logCallFeedbackAction, type CallPipelineActionState } from "../actions/call-pipeline-actions";
import { CALL_STATUS_OPTIONS, EXPERIENCE_RATING_OPTIONS, RETURNING_OPTIONS, CHURCH_ATTENDANCE_OPTIONS } from "../constants";
import { PipelineOverviewDialog } from "./pipeline-overview-dialog";

const initialState: CallPipelineActionState & { success?: boolean; pipelineComplete?: boolean } = { error: null };

export function LogFeedbackDialog({
  open,
  onOpenChange,
  firstTimerId,
  firstTimerName,
  week,
  callerName,
  hasExistingOverview,
  onLogged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firstTimerId: string;
  firstTimerName: string;
  week: number;
  callerName: string;
  hasExistingOverview: boolean;
  onLogged: () => void;
}) {
  const action = logCallFeedbackAction.bind(null, firstTimerId, week, callerName);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [callStatus, setCallStatus] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    if (!state.success) return;
    const t = setTimeout(() => {
      toast.success(`Week ${week} feedback saved.`);
      if (state.pipelineComplete && !hasExistingOverview) {
        setShowOverview(true);
      } else {
        onLogged();
        onOpenChange(false);
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  };

  const isReached = callStatus === "Reached";

  if (showOverview) {
    return (
      <PipelineOverviewDialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) onLogged();
        }}
        firstTimerId={firstTimerId}
        firstTimerName={firstTimerName}
        submittedBy={callerName}
        onDone={() => {
          onLogged();
          onOpenChange(false);
        }}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Week {week} Feedback — {firstTimerName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Call Status</Label>
            <NativeSelect name="call_status" value={callStatus} onChange={(e) => setCallStatus(e.target.value)} required>
              <option value="">Select status</option>
              {CALL_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </NativeSelect>
            {state.fieldErrors?.call_status && <p className="text-xs text-destructive">{state.fieldErrors.call_status}</p>}
          </div>

          {isReached && (
            <>
              <div className="space-y-1.5">
                <Label>Experience Rating</Label>
                <NativeSelect name="experience_rating" defaultValue="">
                  <option value="">Select rating</option>
                  {EXPERIENCE_RATING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label>Returning?</Label>
                <NativeSelect name="returning" defaultValue="">
                  <option value="">Select likelihood</option>
                  {RETURNING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </NativeSelect>
              </div>
            </>
          )}

          {!isReached && callStatus && (
            <div className="space-y-1.5">
              <Label>Scheduled Call-back Date</Label>
              <Input type="date" name="follow_up_date" />
            </div>
          )}

          {week >= 2 && (
            <div className="space-y-1.5">
              <Label>Church Attendance</Label>
              <NativeSelect name="church_attendance" defaultValue="">
                <option value="">Select</option>
                {CHURCH_ATTENDANCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </NativeSelect>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea name="notes" rows={3} placeholder="Key points from the conversation…" />
          </div>

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-destructive">
              <Checkbox checked={flagged} onCheckedChange={(c) => setFlagged(!!c)} />
              <input type="hidden" name="flagged_for_pastoral" value={flagged ? "on" : ""} />
              <Flag size={13} /> Flag for Pastoral Team
            </label>
            {flagged && (
              <div className="space-y-1.5">
                <Textarea name="flag_reason" rows={2} placeholder="Describe the concern that needs pastoral attention…" />
                {state.fieldErrors?.flag_reason && <p className="text-xs text-destructive">{state.fieldErrors.flag_reason}</p>}
              </div>
            )}
          </div>

          {state.error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Saving…" : <><CheckCircle2 size={14} /> Save Week {week} Feedback</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
