"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address") });
type Input = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Input>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Input) => {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Always show success, even if the email doesn't exist — this
      // prevents using the form to check which emails have accounts.
      if (err) throw err;
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-4 text-left">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Check your email</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            If an account exists for that address, we&apos;ve sent a link to reset your password. It may take a minute to arrive — check your spam folder too.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">Forgot password?</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a link to reset it.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label>Email Address</Label>
          <Input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Loader2 className="animate-spin" />}
          {pending ? "Sending…" : <><Send size={14} /> Send Reset Link</>}
        </Button>
      </form>
    </>
  );
}
