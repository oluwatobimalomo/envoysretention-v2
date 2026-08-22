"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { accessRequestSchema, REQUESTABLE_ROLES, type AccessRequestInput } from "../schemas/access-request-schema";
import { submitAccessRequestAction, type AccessRequestActionState } from "../actions/access-requests-actions";
import { ROLE_META, type AppRole } from "@/lib/config/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Loader2, CheckCircle2, Send } from "lucide-react";

const initialState: AccessRequestActionState & { success?: boolean } = { error: null };

export function RequestAccessForm() {
  const [state, formAction, pending] = useActionState(submitAccessRequestAction, initialState);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<AccessRequestInput>({
    resolver: zodResolver(accessRequestSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (state.success) toast.success("Request sent — an admin will review it shortly.");
  }, [state.success]);

  const onValid = () => {
    const form = document.getElementById("request-access-form") as HTMLFormElement;
    startTransition(() => formAction(new FormData(form)));
  };

  const fieldError = (name: keyof AccessRequestInput) => errors[name]?.message ?? state.fieldErrors?.[name];

  if (state.success) {
    const email = getValues("email");
    return (
      <div className="flex flex-col items-start gap-4 text-left">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Request sent</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {email ? <>We&apos;ll email <strong className="text-foreground">{email}</strong> as soon as</> : "You'll be notified as soon as"} an admin approves your access and your login is ready. No further action needed for now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">Request access</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Tell us who you are and which team you&apos;re joining. An admin will review and set up your login.</p>

      <form id="request-access-form" onSubmit={handleSubmit(onValid)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input {...register("full_name")} autoComplete="name" placeholder="e.g. Adaeze Okafor" />
          {fieldError("full_name") && <p className="text-xs text-destructive">{fieldError("full_name")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Email Address</Label>
          <Input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" />
          {fieldError("email") && <p className="text-xs text-destructive">{fieldError("email")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Phone Number</Label>
          <Input {...register("phone")} type="tel" autoComplete="tel" placeholder="+234 xxx xxx xxxx" />
        </div>
        <div className="space-y-1.5">
          <Label>Which team are you joining?</Label>
          <NativeSelect {...register("requested_role")}>
            <option value="">Select a team</option>
            {REQUESTABLE_ROLES.map((r) => <option key={r} value={r}>{ROLE_META[r as AppRole].label}</option>)}
          </NativeSelect>
          {fieldError("requested_role") && <p className="text-xs text-destructive">{fieldError("requested_role")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Anything else? (optional)</Label>
          <Textarea {...register("message")} rows={2} placeholder="e.g. I was invited by..." />
        </div>

        {state.error && !state.success && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Loader2 className="animate-spin" />}
          {pending ? "Sending…" : <><Send size={14} /> Send Request</>}
        </Button>
      </form>
    </>
  );
}
