"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { changePasswordSchema, type ChangePasswordInput } from "../schemas/profile-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm({ email }: { email: string }) {
  const [pending, setPending] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data: ChangePasswordInput) => {
    setPending(true);
    try {
      const supabase = createClient();
      // Re-verify the current password before changing it — standard
      // security practice, not just a formality. signInWithPassword
      // refreshes the session on success without disrupting anything.
      const { error: verifyErr } = await supabase.auth.signInWithPassword({ email, password: data.current_password });
      if (verifyErr) {
        toast.error("Your current password doesn't match.");
        return;
      }
      const { error: updateErr } = await supabase.auth.updateUser({ password: data.new_password });
      if (updateErr) {
        toast.error(updateErr.message);
        return;
      }
      toast.success("Password updated.");
      reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label>Current Password</Label>
        <Input {...register("current_password")} type="password" autoComplete="current-password" />
        {errors.current_password && <p className="text-xs text-destructive">{errors.current_password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>New Password</Label>
        <Input {...register("new_password")} type="password" autoComplete="new-password" placeholder="At least 8 characters" />
        {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Confirm New Password</Label>
        <Input {...register("confirm_password")} type="password" autoComplete="new-password" />
        {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Updating…" : <><KeyRound size={14} /> Change Password</>}
      </Button>
    </form>
  );
}
