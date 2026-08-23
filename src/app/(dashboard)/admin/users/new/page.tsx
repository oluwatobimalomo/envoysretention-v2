import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/features/auth/utils/require-role";
import { CreateUserForm } from "@/features/access-requests/components/create-user-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Add User" };

export default async function AddUserPage() {
  await requireRole(["admin"]);
  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/admin/users"><ArrowLeft size={16} /></Link></Button>
        <h1 className="font-display text-xl font-semibold">Add User Directly</h1>
      </div>
      <p className="text-sm text-muted-foreground -mt-3">Creates a login immediately — no approval step. Use this for people you already know should have access.</p>
      <CreateUserForm />
    </div>
  );
}
