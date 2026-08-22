import { requireRole } from "@/features/auth/utils/require-role";
import { potentialEnvoysService } from "@/features/potential-envoys/services/potential-envoys-service";
import { MyPotentialEnvoysClient } from "@/features/potential-envoys/components/my-potential-envoys-client";

export const metadata = { title: "My Potential Envoys" };

export default async function MyPotentialEnvoysPage() {
  const user = await requireRole(["admin", "experienceadmin", "soulcareadmin", "soulcareteam"]);
  const all = await potentialEnvoysService.listEnriched();
  const mine = all.filter((r) => r.assignment?.assigned_to === user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">My Potential Envoys</h1>
        <p className="text-sm text-muted-foreground">{mine.length} assigned to you</p>
      </div>
      <MyPotentialEnvoysClient rows={mine} callerName={user.fullName} />
    </div>
  );
}
