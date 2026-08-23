import { requireRole } from "@/features/auth/utils/require-role";
import { newConvertsService } from "@/features/new-converts/services/new-converts-service";
import { MyNewConvertsClient } from "@/features/new-converts/components/my-new-converts-client";

export const metadata = { title: "My New Converts" };

export default async function MyNewConvertsPage() {
  const user = await requireRole(["admin", "soulcareadmin", "soulcareteam"]);
  const all = await newConvertsService.listEnriched();
  const mine = all.filter((r) => r.assignment?.assigned_to === user.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">My New Converts</h1>
        <p className="text-sm text-muted-foreground">{mine.length} assigned to you</p>
      </div>
      <MyNewConvertsClient rows={mine} callerName={user.fullName} />
    </div>
  );
}
