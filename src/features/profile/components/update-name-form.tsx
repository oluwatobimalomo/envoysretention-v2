"use client";

import { startTransition, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateNameAction, type ProfileActionState } from "../actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

const initialState: ProfileActionState & { success?: boolean } = { error: null };

export function UpdateNameForm({ currentName }: { currentName: string }) {
  const [state, formAction, pending] = useActionState(updateNameAction, initialState);

  useEffect(() => {
    if (state.success) toast.success("Name updated.");
  }, [state.success]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1 space-y-1.5">
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" name="full_name" defaultValue={currentName} />
        {state.fieldErrors?.full_name && <p className="text-xs text-destructive">{state.fieldErrors.full_name}</p>}
      </div>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Saving…" : <><Save size={14} /> Save</>}
      </Button>
    </form>
  );
}
