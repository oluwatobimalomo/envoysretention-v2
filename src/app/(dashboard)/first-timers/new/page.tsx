import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/features/auth/utils/require-role";
import { FirstTimerForm } from "@/features/first-timers/components/first-timer-form";
import { createFirstTimerAction } from "@/features/first-timers/actions/first-timer-actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Add First-Timer" };

export default async function NewFirstTimerPage() {
  await requireRole(["admin", "dofficer"]);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/first-timers"><ArrowLeft size={16} /></Link></Button>
        <h1 className="text-xl font-semibold">New First-Timer</h1>
      </div>
      <FirstTimerForm action={createFirstTimerAction} />
    </div>
  );
}
