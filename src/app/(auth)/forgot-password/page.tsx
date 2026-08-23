import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { BrandMark } from "@/components/layout/brand-mark";

export const metadata = { title: "Forgot Password · The Envoys" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/login" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
        <BrandMark size={44} className="mb-4" />
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
