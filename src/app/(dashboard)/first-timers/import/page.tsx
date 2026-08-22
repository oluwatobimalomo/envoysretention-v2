import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/features/auth/utils/require-role";
import { CsvImport } from "@/features/first-timers/components/csv-import";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Import First-Timers" };

export default async function ImportFirstTimersPage() {
  await requireRole(["admin", "dofficer"]);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/first-timers"><ArrowLeft size={16} /></Link></Button>
        <h1 className="text-xl font-semibold">Import First-Timers</h1>
      </div>
      <CsvImport />
    </div>
  );
}
