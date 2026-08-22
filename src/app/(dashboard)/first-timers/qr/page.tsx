import { requireRole } from "@/features/auth/utils/require-role";
import { RegistrationQr } from "@/features/first-timers/components/registration-qr";

export const metadata = { title: "First-Timers QR Code" };

export default async function FirstTimersQrPage() {
  await requireRole(["admin", "dofficer"]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <h1 className="text-xl font-semibold">First-Timers QR Code</h1>
        <p className="text-sm text-muted-foreground">Print or display this at the welcome desk for self check-in.</p>
      </div>
      <RegistrationQr url={`${siteUrl}/register`} />
    </div>
  );
}
