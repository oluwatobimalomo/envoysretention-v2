import { requireRole } from "@/features/auth/utils/require-role";
import { RegistrationQr } from "@/features/first-timers/components/registration-qr";

export const metadata = { title: "New Converts QR Code" };

export default async function NewConvertsQrPage() {
  await requireRole(["admin", "dofficer", "soulcareadmin"]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <h1 className="text-xl font-semibold">New Converts QR Code</h1>
        <p className="text-sm text-muted-foreground">Print or display this at the altar call for self check-in.</p>
      </div>
      <RegistrationQr url={`${siteUrl}/register-convert`} />
    </div>
  );
}
