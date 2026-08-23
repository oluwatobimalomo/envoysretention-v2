import { requireRole } from "@/features/auth/utils/require-role";
import { connectCentreService } from "@/features/connect-centre/services/connect-centre-service";
import { ProspectsClient } from "@/features/connect-centre/components/prospects-client";

export const metadata = { title: "Connect Centre" };

export default async function ConnectCentrePage() {
  await requireRole(["admin", "connectcentre"]);
  const rows = await connectCentreService.list();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Prospective Connect Members</h1>
        <p className="text-sm text-muted-foreground">VIPs recommended to a Connect Centre — confirm once they&apos;re added to the centre&apos;s WhatsApp group.</p>
      </div>
      <ProspectsClient rows={rows} />
    </div>
  );
}
