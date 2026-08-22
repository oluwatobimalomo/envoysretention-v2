import { requireRole } from "@/features/auth/utils/require-role";
import { RegistrationQr } from "@/features/first-timers/components/registration-qr";

export const metadata = { title: "Feedback QR Code" };

export default async function FeedbackQrPage() {
  await requireRole(["admin", "experienceadmin", "research"]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Feedback QR Code</h1>
        <p className="text-sm text-muted-foreground">Members scan this to submit anonymous service feedback.</p>
      </div>
      <RegistrationQr url={`${siteUrl}/give-feedback`} />
    </div>
  );
}
