import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/features/auth/utils/require-role";
import { firstTimersService } from "@/features/first-timers/services/first-timers-service";
import { FirstTimerForm } from "@/features/first-timers/components/first-timer-form";
import { updateFirstTimerAction } from "@/features/first-timers/actions/first-timer-actions";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit First-Timer" };

export default async function EditFirstTimerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "dofficer"]);
  const { id } = await params;

  let record;
  try {
    record = await firstTimersService.getById(id);
  } catch {
    notFound();
  }
  if (!record) notFound();

  const boundAction = updateFirstTimerAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/first-timers"><ArrowLeft size={16} /></Link></Button>
        <h1 className="font-display text-xl font-semibold">Edit — {record.full_name}</h1>
      </div>
      <FirstTimerForm action={boundAction} initialData={record} />
    </div>
  );
}
