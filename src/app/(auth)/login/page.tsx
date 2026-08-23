import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";
import { BrandMark } from "@/components/layout/brand-mark";

export const metadata = { title: "Sign in · The Envoys" };

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — brand moment. A single held idea, not a dashboard preview
          pretending to be real data. */}
      <div className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="bg-grid-faint pointer-events-none absolute inset-0" />

        <div className="relative flex items-center gap-3">
          <BrandMark size={40} className="ring-2 ring-sidebar-border" />
          <div>
            <p className="font-display text-lg leading-tight font-bold text-sidebar-foreground">
              THE <span className="text-brand-gold">ENVOYS</span>
            </p>
            <p className="text-xs tracking-wide text-sidebar-foreground/55">RETENTION SYSTEM</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <div className="border-l-2 border-brand-gold pl-5">
            <p className="font-display text-2xl leading-snug text-sidebar-foreground/90 italic xl:text-[28px]">
              &ldquo;Every soul who walks through our doors is remembered, followed, and welcomed home.&rdquo;
            </p>
          </div>
          <p className="mt-4 pl-5 text-xs font-semibold tracking-widest text-brand-gold uppercase">
            From first hello to lasting home
          </p>
        </div>

        <p className="relative text-xs text-sidebar-foreground/40">RCCG The Envoys · EnvoysByte</p>
      </div>

      {/* Right — the actual sign-in form */}
      <div className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-start gap-4 lg:hidden">
            <BrandMark size={44} />
          </div>
          <h1 className="font-display text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 mb-7 text-sm text-muted-foreground">Sign in to continue to your dashboard</p>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New team member? <Link href="/request-access" className="font-medium text-primary hover:underline">Request access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
