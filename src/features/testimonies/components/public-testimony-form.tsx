"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Loader2, Star } from "lucide-react";
import { submitPublicTestimonyAction, type TestimonyActionState } from "../actions/testimonies-actions";
import { TESTIMONY_CATEGORIES } from "../constants";

const initialState: TestimonyActionState & { success?: boolean } = { error: null };

export function PublicTestimonyForm() {
  const [state, formAction, pending] = useActionState(submitPublicTestimonyAction, initialState);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  };

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-gold-light text-brand-gold-foreground">
          <Star size={28} />
        </div>
        <div>
          <p className="font-display text-lg font-semibold">Testimony received!</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">Thank you for sharing what God has done. Your testimony is an encouragement to the whole body.</p>
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
      <div className="space-y-1.5">
        <Label>Testimony Category <span className="text-destructive">*</span></Label>
        <NativeSelect name="category" defaultValue="General Testimony">
          {TESTIMONY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </NativeSelect>
      </div>
      <div className="space-y-1.5">
        <Label>Your Testimony <span className="text-destructive">*</span></Label>
        <Textarea name="testimony" rows={5} placeholder="Share what God has done in your life…" />
        {state.fieldErrors?.testimony && <p className="text-xs text-destructive">{state.fieldErrors.testimony}</p>}
      </div>
      {state.error && !state.success && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} variant="gold" className="w-full">
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Submitting…" : <><Star size={14} /> Share My Testimony</>}
      </Button>
    </form>
  );
}
