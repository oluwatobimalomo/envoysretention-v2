import { requireRole } from "@/features/auth/utils/require-role";
import { soulCareService } from "@/features/soul-care/services/soul-care-service";
import { MyVisitsClient } from "@/features/soul-care/components/my-visits-client";

export const metadata = { title: "My Visits" };

export default async function MyVisitsPage() {
  const user = await requireRole(["admin", "soulcareadmin", "soulcareteam"]);
  const all = await soulCareService.listEnriched();
  const mine = all.filter((c) => c.assignment?.assigned_to === user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">My Visits</h1>
        <p className="text-sm text-muted-foreground">{mine.length} contact{mine.length !== 1 ? "s" : ""} assigned to you</p>
      </div>
      <MyVisitsClient rows={mine} loggedBy={user.fullName} />
    </div>
  );
}
