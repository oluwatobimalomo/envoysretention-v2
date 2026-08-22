import { requireRole } from "@/features/auth/utils/require-role";
import { RegistrationQr } from "@/features/first-timers/components/registration-qr";

export const metadata = { title: "Testimony QR Code" };

export default async function TestimonyQrPage() {
  await requireRole(["admin", "testimonyteam"]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Testimony QR Code</h1>
        <p className="text-sm text-muted-foreground">Share this at services or on social channels so members can share testimonies.</p>
      </div>
      <RegistrationQr url={`${siteUrl}/share-testimony`} />
    </div>
  );
}
