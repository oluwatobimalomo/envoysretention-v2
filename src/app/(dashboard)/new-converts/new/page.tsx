import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/features/auth/utils/require-role";
import { NewConvertForm } from "@/features/new-converts/components/new-convert-form";
import { createNewConvertAction } from "@/features/new-converts/actions/new-converts-actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Add New Convert" };

export default async function AddNewConvertPage() {
  await requireRole(["admin", "dofficer", "soulcareadmin"]);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/new-converts"><ArrowLeft size={16} /></Link></Button>
        <h1 className="text-xl font-semibold">Add New Convert</h1>
      </div>
      <p className="text-sm text-muted-foreground -mt-3">Log someone who gave their life to Christ or rededicated at a service.</p>
      <NewConvertForm action={createNewConvertAction} />
    </div>
  );
}
