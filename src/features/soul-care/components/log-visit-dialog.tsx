"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { PhotoUpload } from "./photo-upload";
import { Loader2, Save, Flag } from "lucide-react";
import { toast } from "sonner";
import { logVisitAction, type SoulCareActionState } from "../actions/soul-care-actions";
import { SC_VISIT_TYPES, VISIT_STATUS_OPTIONS, URGENCY_OPTIONS, scGenderTag } from "../constants";

const initialState: SoulCareActionState & { success?: boolean } = { error: null };

export function LogVisitDialog({
  open,
  onOpenChange,
  contactId,
  contactName,
  contactGender,
  loggedBy,
  onLogged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
  contactGender?: string | null;
  loggedBy: string;
  onLogged: () => void;
}) {
  const action = logVisitAction.bind(null, contactId, loggedBy);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [photoUrl, setPhotoUrl] = useState("");
  const [materialSupport, setMaterialSupport] = useState(false);
  const [followUp, setFollowUp] = useState(false);
  const [escalate, setEscalate] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Visit logged.");
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
        <DialogHeader>
          <DialogTitle>Log Visit — {contactName}{scGenderTag(contactGender)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="visit_photo_url" value={photoUrl} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type of Visit <span className="text-destructive">*</span></Label>
              <NativeSelect name="visit_type" required defaultValue="">
                <option value="">Select type</option>
                {SC_VISIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
              {state.fieldErrors?.visit_type && <p className="text-xs text-destructive">{state.fieldErrors.visit_type}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Urgency</Label>
              <NativeSelect name="urgency" defaultValue="">
                <option value="">Select urgency</option>
                {URGENCY_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Reason for Care</Label>
            <Input name="reason_for_care" placeholder="e.g. Follow-up after hospital visit" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Visit Status <span className="text-destructive">*</span></Label>
              <NativeSelect name="visit_status" required defaultValue="">
                <option value="">Select status</option>
                {VISIT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
              {state.fieldErrors?.visit_status && <p className="text-xs text-destructive">{state.fieldErrors.visit_status}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Visit Date</Label>
              <Input type="date" name="visit_date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Meeting Notes</Label>
            <Textarea name="meeting_notes" rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Photo</Label>
            <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
          </div>

          <div className="space-y-1.5">
            <Label>Prayer Requests</Label>
            <Textarea name="prayer_requests" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Testimony</Label>
            <Textarea name="testimony" rows={2} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={materialSupport} onCheckedChange={(c) => setMaterialSupport(!!c)} />
            <input type="hidden" name="material_support" value={materialSupport ? "on" : ""} />
            Material support provided
          </label>
          {materialSupport && <Textarea name="material_support_notes" rows={2} placeholder="Details…" />}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={followUp} onCheckedChange={(c) => setFollowUp(!!c)} />
            <input type="hidden" name="follow_up_required" value={followUp ? "on" : ""} />
            Follow-up required
          </label>
          {followUp && <Input type="date" name="next_follow_up_date" />}

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-destructive">
              <Checkbox checked={escalate} onCheckedChange={(c) => setEscalate(!!c)} />
              <input type="hidden" name="escalate_to_pastorate" value={escalate ? "on" : ""} />
              <Flag size={13} /> Escalate to Pastorate
            </label>
            {escalate && (
              <>
                <Textarea name="escalation_reason" rows={2} placeholder="Reason for escalation…" />
                {state.fieldErrors?.escalation_reason && <p className="text-xs text-destructive">{state.fieldErrors.escalation_reason}</p>}
              </>
            )}
          </div>

          {state.error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Saving…" : <><Save size={14} /> Save Visitation Record</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
