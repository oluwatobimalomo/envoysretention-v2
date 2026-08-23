"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((v) => v.password === v.confirm_password, { message: "Passwords don't match", path: ["confirm_password"] });
type Input = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Input>({ resolver: zodResolver(schema) });

  // The password-reset link Supabase emails carries a recovery token in
  // the URL; the browser client picks it up automatically on load and
  // establishes a temporary "recovery" session — we just need to wait
  // for that before showing the form.
  useEffect(() => {
    const supabase = createClient();
    const readyRef = { current: false };
    const markReady = () => { readyRef.current = true; setReady(true); };

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") markReady();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });
    const timeout = setTimeout(() => {
      if (!readyRef.current) setInvalid(true);
    }, 2500);

    return () => { sub.subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  const onSubmit = async (data: Input) => {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password: data.password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-start gap-4 text-left">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Password updated</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Taking you to sign in…</p>
        </div>
      </div>
    );
  }

  if (invalid) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Link expired</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">This password reset link is invalid or has expired. Request a new one from the sign-in page.</p>
      </div>
    );
  }

  if (!ready) {
    return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" size={20} /></div>;
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label>New Password</Label>
          <Input {...register("password")} type="password" autoComplete="new-password" placeholder="At least 8 characters" />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Confirm New Password</Label>
          <Input {...register("confirm_password")} type="password" autoComplete="new-password" />
          {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
        </div>
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Loader2 className="animate-spin" />}
          {pending ? "Updating…" : <><KeyRound size={14} /> Update Password</>}
        </Button>
      </form>
    </>
  );
}
