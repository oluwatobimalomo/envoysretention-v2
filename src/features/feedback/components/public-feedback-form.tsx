"use client";

import { startTransition, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { submitPublicFeedbackAction, type FeedbackActionState } from "../actions/feedback-actions";
import { FEEDBACK_FOCUS_POINTS } from "../constants";

const initialState: FeedbackActionState & { success?: boolean } = { error: null };

export function PublicFeedbackForm() {
  const [state, formAction, pending] = useActionState(submitPublicFeedbackAction, initialState);
  const [focusPoints, setFocusPoints] = useState<string[]>([]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  };

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <p className="font-display text-lg font-semibold">Thank you</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">Your feedback helps us grow. We&apos;re grateful you took the time to share.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Your Name <span className="font-normal text-muted-foreground">(optional — leave blank to stay anonymous)</span></Label>
        <Input name="name" placeholder="Optional" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <NativeSelect name="gender" defaultValue=""><option value="">Optional</option><option>Male</option><option>Female</option></NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label>Phone Number</Label>
          <Input name="phone" placeholder="Optional" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Membership Status <span className="text-destructive">*</span></Label>
        <NativeSelect name="membership_status" required defaultValue="">
          <option value="">Select</option>
          <option>Member</option>
          <option>Steward</option>
        </NativeSelect>
        {state.fieldErrors?.membership_status && <p className="text-xs text-destructive">{state.fieldErrors.membership_status}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Feedback Focus Points <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FEEDBACK_FOCUS_POINTS.map((p) => {
            const checked = focusPoints.includes(p);
            return (
              <label key={p} className="flex items-center gap-2 text-sm">
                <Checkbox checked={checked} onCheckedChange={(c) => setFocusPoints((prev) => (c ? [...prev, p] : prev.filter((x) => x !== p)))} />
                {p}
                {checked && <input type="hidden" name="focus_points" value={p} />}
              </label>
            );
          })}
        </div>
        {state.fieldErrors?.focus_points && <p className="text-xs text-destructive">{state.fieldErrors.focus_points}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Your Feedback <span className="text-destructive">*</span></Label>
        <Textarea name="feedback" rows={4} placeholder="Share your experience, suggestions, or thoughts about our services…" />
        {state.fieldErrors?.feedback && <p className="text-xs text-destructive">{state.fieldErrors.feedback}</p>}
      </div>

      {state.error && !state.success && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Submitting…" : <><Send size={14} /> Submit Feedback</>}
      </Button>
    </form>
  );
}
