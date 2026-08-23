import { requireRole } from "@/features/auth/utils/require-role";
import { megastarsService } from "@/features/megastars/services/megastars-service";
import { ServicesClient } from "@/features/megastars/components/services-client";

export const metadata = { title: "Megastars Services" };

export default async function MegastarsServicesPage() {
  await requireRole(["admin", "dofficer", "megastarsadmin"]);
  const services = await megastarsService.listServices();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Megastars Services</h1>
        <p className="text-sm text-muted-foreground">Open a service before check-in can begin.</p>
      </div>
      <ServicesClient services={services} />
    </div>
  );
}
