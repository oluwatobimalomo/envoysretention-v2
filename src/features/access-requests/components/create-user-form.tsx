"use client";

import { startTransition, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Loader2, UserPlus, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { createUserDirectlyAction, type CreateUserActionState } from "../actions/access-requests-actions";
import { APP_ROLES, ROLE_META } from "@/lib/config/roles";

const initialState: CreateUserActionState & { success?: boolean; tempPassword?: string } = { error: null };

export function CreateUserForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createUserDirectlyAction, initialState);
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail(new FormData(e.currentTarget).get("email") as string);
    startTransition(() => formAction(new FormData(e.currentTarget)));
  };

  const copyCreds = () => {
    navigator.clipboard.writeText(`Email: ${email}\nTemporary password: ${state.tempPassword}`);
    toast.success("Copied to clipboard.");
  };

  if (state.success && state.tempPassword) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Account created. Share these details securely — this password won&apos;t be shown again.</p>
        <div className="space-y-2 rounded-lg border bg-muted/50 p-4 font-mono text-sm">
          <p className="flex items-center gap-1.5"><Mail size={13} /> {email}</p>
          <p>Temporary password: <strong>{state.tempPassword}</strong></p>
        </div>
        <div className="flex gap-2">
          <Button onClick={copyCreds} variant="outline" className="flex-1"><Copy size={14} /> Copy</Button>
          <Button onClick={() => router.push("/admin/users")} className="flex-1">Done</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Full Name</Label>
        <Input name="full_name" placeholder="e.g. Adaeze Okafor" />
        {state.fieldErrors?.full_name && <p className="text-xs text-destructive">{state.fieldErrors.full_name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Email Address</Label>
        <Input name="email" type="email" placeholder="you@example.com" />
        {state.fieldErrors?.email && <p className="text-xs text-destructive">{state.fieldErrors.email}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Role</Label>
        <NativeSelect name="role" defaultValue="">
          <option value="">Select a role</option>
          {APP_ROLES.map((r) => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
        </NativeSelect>
        {state.fieldErrors?.role && <p className="text-xs text-destructive">{state.fieldErrors.role}</p>}
      </div>
      {state.error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Creating…" : <><UserPlus size={14} /> Create Account</>}
      </Button>
    </form>
  );
}
