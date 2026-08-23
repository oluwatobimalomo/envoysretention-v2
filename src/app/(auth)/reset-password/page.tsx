import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { BrandMark } from "@/components/layout/brand-mark";

export const metadata = { title: "Reset Password · The Envoys" };

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <BrandMark size={44} className="mb-4" />
        <ResetPasswordForm />
      </div>
    </div>
  );
}
