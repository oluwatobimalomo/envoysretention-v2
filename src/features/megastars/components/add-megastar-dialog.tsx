"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { addMegastarAction, lookupGuardianAction, type MegastarActionState } from "../actions/megastars-actions";
import { MEGASTAR_CLASSES } from "../constants";
import type { GuardianRow } from "../services/megastars-service";

const initialState: MegastarActionState & { success?: boolean } = { error: null };

export function AddMegastarDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (open: boolean) => void; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(addMegastarAction, initialState);
  const [mode, setMode] = useState<"existing" | "new">("new");
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<GuardianRow | null>(null);
  const [looking, setLooking] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Child registered.");
      onDone();
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const lookup = async () => {
    setLooking(true);
    const g = await lookupGuardianAction(phone);
    setFound(g);
    if (!g) toast.error("No guardian found with that phone number — switch to 'New Guardian'.");
    setLooking(false);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a Megastar</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="guardian_mode" value={mode} />
          {mode === "existing" && <input type="hidden" name="existing_guardian_id" value={found?.id ?? ""} />}

          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Guardian</p>
            <div className="mb-3 flex gap-2">
              <Button type="button" size="sm" variant={mode === "existing" ? "default" : "outline"} onClick={() => setMode("existing")}>Existing Guardian</Button>
              <Button type="button" size="sm" variant={mode === "new" ? "default" : "outline"} onClick={() => setMode("new")}>New Guardian</Button>
            </div>

            {mode === "existing" ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Guardian phone number" className="flex-1" />
                  <Button type="button" variant="outline" onClick={lookup} disabled={looking}>
                    {looking ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Look Up
                  </Button>
                </div>
                {found && <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">Found: <strong>{found.full_name}</strong> · {found.phone}</p>}
                {state.fieldErrors?.existing_guardian_id && <p className="text-xs text-destructive">{state.fieldErrors.existing_guardian_id}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Guardian Full Name <span className="text-destructive">*</span></Label>
                  <Input name="guardian_full_name" />
                  {state.fieldErrors?.guardian_full_name && <p className="text-xs text-destructive">{state.fieldErrors.guardian_full_name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Guardian Phone <span className="text-destructive">*</span></Label>
                  <Input name="guardian_phone" />
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Child</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Child&apos;s Full Name <span className="text-destructive">*</span></Label>
                <Input name="child_full_name" />
                {state.fieldErrors?.child_full_name && <p className="text-xs text-destructive">{state.fieldErrors.child_full_name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <NativeSelect name="gender" defaultValue=""><option value="">Select</option><option>Male</option><option>Female</option></NativeSelect>
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input type="date" name="dob" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <NativeSelect name="class" defaultValue="">
                    <option value="">Select class</option>
                    {MEGASTAR_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </NativeSelect>
                </div>
                <div className="space-y-1.5">
                  <Label>Relationship</Label>
                  <NativeSelect name="relationship" defaultValue="Parent">
                    <option>Parent</option><option>Grandparent</option><option>Guardian</option><option>Other</option>
                  </NativeSelect>
                </div>
              </div>
            </div>
          </div>

          {state.error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Saving…" : <><UserPlus size={14} /> Register Child</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
