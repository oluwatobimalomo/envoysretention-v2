import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RequestAccessForm } from "@/features/access-requests/components/request-access-form";
import { BrandMark } from "@/components/layout/brand-mark";

export const metadata = { title: "Request Access · The Envoys" };

export default function RequestAccessPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/login" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
        <BrandMark size={44} className="mb-4" />
        <RequestAccessForm />
      </div>
    </div>
  );
}
