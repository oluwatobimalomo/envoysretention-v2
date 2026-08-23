import { requireUser } from "@/features/auth/utils/require-role";
import { ROLE_META } from "@/lib/config/roles";
import { UpdateNameForm } from "@/features/profile/components/update-name-form";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck } from "lucide-react";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {user.email && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Mail size={13} /> {user.email}</span>
          )}
          <Badge variant="secondary"><ShieldCheck size={11} /> {ROLE_META[user.role].label}</Badge>
        </div>
        <UpdateNameForm currentName={user.fullName} />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 font-display font-medium">Change Password</h2>
        <ChangePasswordForm email={user.email ?? ""} />
      </div>

      <p className="text-xs text-muted-foreground">
        Your role and account status are managed by an administrator — contact one if either needs to change.
      </p>
    </div>
  );
}
