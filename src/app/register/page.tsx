import { FirstTimerForm } from "@/features/first-timers/components/first-timer-form";
import { publicRegisterAction } from "@/features/first-timers/actions/first-timer-actions";
import { BrandMark } from "@/components/layout/brand-mark";

export const metadata = { title: "Welcome · The Envoys" };

/**
 * Public self-registration form — no auth, reachable via the QR code
 * printed from /first-timers/qr. Ports V1's PublicForm 1:1: same
 * fields, same "publicMode" restrictions (no membership_decision /
 * heard_from), backed now by RLS's `first_timers_insert_public` policy
 * instead of an unrestricted anon key.
 */
export default function PublicRegisterPage() {
  return (
    <div className="flex min-h-svh justify-center bg-gradient-to-b from-brand-green-light to-background px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <BrandMark size={72} />
          <h1 className="text-xl font-semibold">Welcome to The Envoys!</h1>
          <p className="text-sm text-muted-foreground">We&apos;re so glad you&apos;re here. Tell us a bit about yourself.</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <FirstTimerForm action={publicRegisterAction} publicMode />
        </div>
      </div>
    </div>
  );
}
