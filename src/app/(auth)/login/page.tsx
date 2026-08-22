import { LoginForm } from "@/features/auth/components/login-form";
import { BrandMark } from "@/components/layout/brand-mark";
export const metadata = { title: "Sign in · The Envoys" };
export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-brand-green-light via-background to-background px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg shadow-primary/5">
        <div className="mb-7 flex flex-col items-center gap-2.5 text-center">
          <BrandMark size={64} />
          <h1 className="font-display text-xl font-semibold">The Envoys</h1>
          <p className="text-sm text-muted-foreground">Sign in to your dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
