import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/features/auth/utils/require-role";
import { SoulCareCsvImport } from "@/features/soul-care/components/csv-import";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Import Contacts" };

export default async function SoulCareImportPage() {
  await requireRole(["admin", "soulcareadmin"]);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/soul-care/queue"><ArrowLeft size={16} /></Link></Button>
        <h1 className="text-xl font-semibold">Import Soul Care Contacts</h1>
      </div>
      <SoulCareCsvImport />
    </div>
  );
}
