"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { firstTimerSchema, type FirstTimerInput, BLANK_FIRST_TIMER } from "../schemas/first-timer-schema";
import type { FirstTimerActionState } from "../actions/first-timer-actions";
import { checkDupesAction } from "../actions/first-timer-actions";
import { AREAS_OF_INTEREST, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, LIFE_STAGE_OPTIONS, MEMBERSHIP_DECISION_OPTIONS } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeSelect } from "@/components/ui/native-select";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { FirstTimerRow } from "../services/first-timers-service";

type Action = (prev: FirstTimerActionState, formData: FormData) => Promise<FirstTimerActionState & { success?: boolean }>;

export function FirstTimerForm({
  action,
  initialData,
  publicMode = false,
  onSuccess,
}: {
  action: Action;
  initialData?: FirstTimerRow;
  publicMode?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState<FirstTimerActionState & { success?: boolean }, FormData>(action, { error: null });

  const defaultValues: FirstTimerInput = initialData
    ? {
        full_name: initialData.full_name,
        phone: initialData.phone,
        email: initialData.email ?? "",
        gender: (initialData.gender ?? "") as FirstTimerInput["gender"],
        dob: initialData.dob ?? "",
        marital_status: (initialData.marital_status ?? "") as FirstTimerInput["marital_status"],
        house_address: initialData.house_address ?? "",
        nearest_landmark: initialData.nearest_landmark ?? "",
        membership_decision: (initialData.membership_decision ?? "") as FirstTimerInput["membership_decision"],
        life_stage: (initialData.life_stage ?? "") as FirstTimerInput["life_stage"],
        heard_from: initialData.heard_from ?? "",
        areas_of_interest: initialData.areas_of_interest ?? [],
        service_feedback: initialData.service_feedback ?? "",
        service_date: initialData.service_date,
      }
    : BLANK_FIRST_TIMER;

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FirstTimerInput>({
    resolver: zodResolver(firstTimerSchema),
    defaultValues,
    mode: "onBlur",
  });

  const phone = useWatch({ control, name: "phone" });
  const [dupes, setDupes] = useState<{ id: string; full_name: string; phone: string; service_date: string }[]>([]);
  const [checkingDupes, setCheckingDupes] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const isValidPhone = !initialData && phone && phone.replace(/\D/g, "").length >= 7;
    const t = setTimeout(async () => {
      if (cancelled) return;
      if (!isValidPhone) {
        setDupes([]);
        setCheckingDupes(false);
        return;
      }
      setCheckingDupes(true);
      try {
        const found = await checkDupesAction(phone, initialData ? (initialData as FirstTimerRow).id : undefined);
        if (!cancelled) setDupes(found as never);
      } finally {
        if (!cancelled) setCheckingDupes(false);
      }
    }, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [phone, initialData]);

  useEffect(() => {
    if (state.success) {
      toast.success("Thanks! Your details have been received.");
      if (publicMode) reset(BLANK_FIRST_TIMER);
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const onValid = () => {
    const form = document.getElementById("first-timer-form") as HTMLFormElement;
    startTransition(() => { formAction(new FormData(form)); });
  };

  const fieldError = (name: keyof FirstTimerInput) => errors[name]?.message ?? state.fieldErrors?.[name];

  if (publicMode && state.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">You&apos;re all set!</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Thanks for letting us know you&apos;re here — someone from our team will reach out to you this week.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>Register another person</Button>
      </div>
    );
  }

  return (
    <form id="first-timer-form" action={formAction} onSubmit={handleSubmit(onValid)} className="space-y-8" autoComplete="on" noValidate>
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" error={fieldError("full_name")} required>
            <Input {...register("full_name")} autoComplete="name" placeholder="e.g. Adaeze Okafor" aria-invalid={!!fieldError("full_name")} />
          </Field>
          <Field label="Phone Number" error={fieldError("phone")} required>
            <Input {...register("phone")} type="tel" autoComplete="tel" placeholder="+234 xxx xxx xxxx" aria-invalid={!!fieldError("phone")} />
          </Field>
        </div>

        {checkingDupes && <p className="text-xs text-muted-foreground">Checking for existing records…</p>}
        {!checkingDupes && dupes.length > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
            <div>
              <p className="font-medium">This phone number may already be registered</p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {dupes.slice(0, 3).map((d) => (
                  <li key={d.id}>{d.full_name} — {d.phone} · {d.service_date}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gender" error={fieldError("gender")} required>
            <NativeSelect {...register("gender")} autoComplete="sex" aria-invalid={!!fieldError("gender")}>
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Email Address" error={fieldError("email")}>
            <Input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of Birth" error={fieldError("dob")} hint="Optional — powers birthday reminders">
            <Input {...register("dob")} type="date" autoComplete="bday" />
          </Field>
          <Field label="Marital Status" error={fieldError("marital_status")}>
            <NativeSelect {...register("marital_status")}>
              <option value="">Select status</option>
              {MARITAL_STATUS_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </NativeSelect>
          </Field>
        </div>

        <Field label="House Address" error={fieldError("house_address")}>
          <Input {...register("house_address")} autoComplete="street-address" placeholder="Street, City" />
        </Field>
        <Field label="Nearest Landmark" error={fieldError("nearest_landmark")}>
          <Input {...register("nearest_landmark")} placeholder="e.g. Near Chevron Roundabout" />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Visit Details</h2>

        {/* Membership Decision & Heard From — now shown to everyone,
            staff and public self-registration alike, per request. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Membership Decision" error={fieldError("membership_decision")}>
            <NativeSelect {...register("membership_decision")}>
              <option value="">Select decision</option>
              {MEMBERSHIP_DECISION_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Life Stage" error={fieldError("life_stage")}>
            <NativeSelect {...register("life_stage")}>
              <option value="">Select life stage</option>
              {LIFE_STAGE_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </NativeSelect>
          </Field>
        </div>

        <Field label="How did you hear about us?" error={fieldError("heard_from")}>
          <Input {...register("heard_from")} placeholder="e.g. Friend invited me" />
        </Field>

        <Field label="Areas of Interest" error={fieldError("areas_of_interest")}>
          <Controller
            control={control}
            name="areas_of_interest"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {AREAS_OF_INTEREST.map((a) => {
                  const checked = field.value?.includes(a.value);
                  return (
                    <label key={a.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => {
                          const next = c ? [...(field.value ?? []), a.value] : (field.value ?? []).filter((v) => v !== a.value);
                          field.onChange(next);
                        }}
                      />
                      {a.label}
                      {checked && <input type="hidden" name="areas_of_interest" value={a.value} />}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </Field>

        <Field label="Service Feedback" error={fieldError("service_feedback")}>
          <Textarea {...register("service_feedback")} placeholder="Any thoughts on today's service…" rows={3} />
        </Field>

        <Field label="Service Date" error={fieldError("service_date")} required>
          <Input {...register("service_date")} type="date" />
        </Field>
      </section>

      {state.error && !state.success && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Saving…" : initialData ? "Save Changes" : publicMode ? "Submit" : "Add First-Timer"}
      </Button>
    </form>
  );
}

function Field({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="text-destructive">*</span>}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
