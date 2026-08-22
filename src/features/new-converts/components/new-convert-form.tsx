"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { newConvertSchema, type NewConvertInput } from "../schemas/new-convert-schema";
import type { NcActionState } from "../actions/new-converts-actions";
import { checkDupesAction } from "../actions/new-converts-actions";
import { CONVERSION_TYPES } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

type Action = (prev: NcActionState, formData: FormData) => Promise<NcActionState & { success?: boolean }>;

const BLANK: NewConvertInput = {
  full_name: "", phone: "", gender: undefined as never, conversion_type: "New Salvation",
  conversion_date: new Date().toISOString().slice(0, 10),
};

export function NewConvertForm({ action, publicMode = false }: { action: Action; publicMode?: boolean }) {
  const [state, formAction, pending] = useActionState<NcActionState & { success?: boolean }, FormData>(action, { error: null });
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<NewConvertInput>({
    resolver: zodResolver(newConvertSchema),
    defaultValues: BLANK,
    mode: "onBlur",
  });

  const phone = useWatch({ control, name: "phone" });
  const [dupes, setDupes] = useState<{ id: string; full_name: string; phone: string; conversion_date: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      if (!phone || phone.replace(/\D/g, "").length < 7) { setDupes([]); return; }
      const found = await checkDupesAction(phone);
      if (!cancelled) setDupes(found as never);
    }, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [phone]);

  useEffect(() => {
    if (state.success) {
      toast.success("Thanks — you're on record!");
      if (publicMode) reset(BLANK);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const onValid = () => {
    const form = document.getElementById("new-convert-form") as HTMLFormElement;
    startTransition(() => formAction(new FormData(form)));
  };

  const fieldError = (name: keyof NewConvertInput) => errors[name]?.message ?? state.fieldErrors?.[name];

  if (publicMode && state.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Welcome to the family!</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Someone from our team will reach out to walk with you this month.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>Register another person</Button>
      </div>
    );
  }

  return (
    <form id="new-convert-form" action={formAction} onSubmit={handleSubmit(onValid)} className="space-y-4" autoComplete="on" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Full Name <span className="text-destructive">*</span></Label>
          <Input {...register("full_name")} autoComplete="name" placeholder="e.g. Adaeze Okafor" aria-invalid={!!fieldError("full_name")} />
          {fieldError("full_name") && <p className="text-xs text-destructive">{fieldError("full_name")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Phone Number <span className="text-destructive">*</span></Label>
          <Input {...register("phone")} type="tel" autoComplete="tel" placeholder="+234 xxx xxx xxxx" aria-invalid={!!fieldError("phone")} />
          {fieldError("phone") && <p className="text-xs text-destructive">{fieldError("phone")}</p>}
        </div>
      </div>

      {dupes.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <p className="font-medium">This phone number may already be on record</p>
            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              {dupes.slice(0, 3).map((d) => <li key={d.id}>{d.full_name} — {d.phone} · {d.conversion_date}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <NativeSelect {...register("gender")} autoComplete="sex">
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <NativeSelect {...register("conversion_type")}>
            {CONVERSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{publicMode ? "Today's Date" : "Conversion Date"} <span className="text-destructive">*</span></Label>
        <Input {...register("conversion_date")} type="date" />
        {fieldError("conversion_date") && <p className="text-xs text-destructive">{fieldError("conversion_date")}</p>}
      </div>

      {state.error && !state.success && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Saving…" : publicMode ? "Submit" : "Add New Convert"}
      </Button>
    </form>
  );
}
