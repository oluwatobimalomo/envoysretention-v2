"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Copy, ShieldCheck, ShieldOff, Clock, KeyRound } from "lucide-react";
import { formatDateTime } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  approveAccessRequestAction, denyAccessRequestAction, setProfileActiveAction,
  setProfileRoleAction, resetUserPasswordAction,
} from "../actions/access-requests-actions";
import { ROLE_META, APP_ROLES, type AppRole } from "@/lib/config/roles";
import type { AccessRequestRow } from "../services/access-requests-service";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export function AdminUsersClient({ pendingRequests, profiles }: { pendingRequests: AccessRequestRow[]; profiles: ProfileRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"requests" | "team">(pendingRequests.length > 0 ? "requests" : "team");
  const [credentials, setCredentials] = useState<{ tempPassword: string; name: string } | null>(null);

  const handleApprove = (req: AccessRequestRow) => {
    startTransition(async () => {
      try {
        await approveAccessRequestAction(req.id);
        toast.success(`${req.full_name} approved — they can sign in now with the password they set.`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't approve this request.");
      }
    });
  };

  const handleDeny = (req: AccessRequestRow) => {
    const reason = prompt(`Reason for denying ${req.full_name}'s request (optional):`, "") ?? "";
    startTransition(async () => {
      await denyAccessRequestAction(req.id, reason);
      toast.success("Request denied.");
      router.refresh();
    });
  };

  const toggleActive = (profile: ProfileRow) => {
    startTransition(async () => {
      await setProfileActiveAction(profile.id, !profile.is_active);
      toast.success(profile.is_active ? `${profile.full_name} deactivated.` : `${profile.full_name} reactivated.`);
      router.refresh();
    });
  };

  const changeRole = (profile: ProfileRow, role: string) => {
    startTransition(async () => {
      await setProfileRoleAction(profile.id, role);
      toast.success(`${profile.full_name}'s role updated.`);
      router.refresh();
    });
  };

  const handleResetPassword = (profile: ProfileRow) => {
    if (!confirm(`Reset ${profile.full_name}'s password? Their current password will stop working immediately.`)) return;
    startTransition(async () => {
      try {
        const result = await resetUserPasswordAction(profile.id);
        setCredentials({ tempPassword: result.tempPassword, name: profile.full_name });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't reset this password.");
      }
    });
  };

  const copyCreds = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`Temporary password for ${credentials.name}: ${credentials.tempPassword}`);
    toast.success("Copied to clipboard.");
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Button variant={tab === "requests" ? "default" : "ghost"} size="sm" onClick={() => setTab("requests")}>
          Pending Requests {pendingRequests.length > 0 && <Badge variant="destructive" className="ml-1">{pendingRequests.length}</Badge>}
        </Button>
        <Button variant={tab === "team" ? "default" : "ghost"} size="sm" onClick={() => setTab("team")}>
          Team Members ({profiles.length})
        </Button>
      </div>

      {tab === "requests" && (
        <div className="space-y-2">
          {pendingRequests.length === 0 && (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No pending requests.</div>
          )}
          {pendingRequests.map((req) => (
            <div key={req.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{req.full_name}</p>
                  <p className="text-xs text-muted-foreground">{req.email}{req.phone ? ` · ${req.phone}` : ""}</p>
                  <p className="mt-1 text-xs"><Badge variant="secondary">{ROLE_META[req.requested_role as AppRole]?.label ?? req.requested_role}</Badge></p>
                  {req.message && <p className="mt-2 text-sm text-muted-foreground">&ldquo;{req.message}&rdquo;</p>}
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock size={10} /> {formatDateTime(req.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDeny(req)} disabled={isPending}><X size={13} /> Deny</Button>
                  <Button size="sm" onClick={() => handleApprove(req)} disabled={isPending}><Check size={13} /> Approve</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-2">
          {profiles.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4" style={{ opacity: p.is_active ? 1 : 0.6 }}>
              <div>
                <p className="font-medium">{p.full_name}</p>
                <p className="text-xs text-muted-foreground">{p.is_active ? "Active" : "Deactivated"}</p>
              </div>
              <div className="flex items-center gap-2">
                <NativeSelect className="w-44" value={p.role} onChange={(e) => changeRole(p, e.target.value)} disabled={isPending}>
                  {APP_ROLES.map((r) => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
                </NativeSelect>
                <Button size="sm" variant="outline" onClick={() => handleResetPassword(p)} disabled={isPending}>
                  <KeyRound size={13} /> Reset Password
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(p)} disabled={isPending}>
                  {p.is_active ? <><ShieldOff size={13} /> Deactivate</> : <><ShieldCheck size={13} /> Reactivate</>}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!credentials} onOpenChange={(o) => !o && setCredentials(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Password reset</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share this new temporary password with {credentials?.name} securely (in person or via a private message) — it won&apos;t be shown again. They should change it after logging in.
            </p>
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4 font-mono text-sm">
              <p className="flex items-center gap-1.5"><KeyRound size={13} /> {credentials?.name}</p>
              <p>New password: <strong>{credentials?.tempPassword}</strong></p>
            </div>
            <Button onClick={copyCreds} variant="outline" className="w-full"><Copy size={14} /> Copy to clipboard</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
