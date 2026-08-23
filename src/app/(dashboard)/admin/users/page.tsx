import { requireRole } from "@/features/auth/utils/require-role";
import { accessRequestsService } from "@/features/access-requests/services/access-requests-service";
import { AdminUsersClient } from "@/features/access-requests/components/admin-users-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  await requireRole(["admin"]);
  const [pendingRequests, profiles] = await Promise.all([
    accessRequestsService.listPending(),
    accessRequestsService.listProfiles(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">Review access requests and manage team logins.</p>
        </div>
        <Button asChild size="sm"><Link href="/admin/users/new"><UserPlus size={14} /> Add User Directly</Link></Button>
      </div>
      <AdminUsersClient pendingRequests={pendingRequests} profiles={profiles} />
    </div>
  );
}
