import { requireRole } from "@/features/auth/utils/require-role";
import { megastarsService } from "@/features/megastars/services/megastars-service";
import { CheckInOutClient } from "@/features/megastars/components/check-in-out-client";

export const metadata = { title: "Check In / Out" };

export default async function MegastarsCheckInOutPage() {
  await requireRole(["admin", "dofficer", "megastars", "megastarsadmin"]);
  const service = await megastarsService.getOpenService();
  const activeList = service ? await megastarsService.listActiveCheckins(service.id) : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Check In / Check Out</h1>
        <p className="text-sm text-muted-foreground">Megastars front desk</p>
      </div>
      <CheckInOutClient service={service} activeList={activeList} />
    </div>
  );
}
