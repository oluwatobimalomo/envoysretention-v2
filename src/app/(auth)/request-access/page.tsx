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
        <div className="mb-7 flex flex-col items-start gap-4">
          <BrandMark size={44} />
          <div>
            <h1 className="font-display text-2xl font-semibold">Request access</h1>
            <p className="mt-1 text-sm text-muted-foreground">Tell us who you are and which team you&apos;re joining. An admin will review and set up your login.</p>
          </div>
        </div>
        <RequestAccessForm />
      </div>
    </div>
  );
}
