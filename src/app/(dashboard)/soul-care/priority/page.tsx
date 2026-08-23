import { requireRole } from "@/features/auth/utils/require-role";
import { churchMembersService } from "@/features/church-members/services/church-members-service";
import { CarePriorityClient } from "@/features/church-members/components/care-priority-client";

export const metadata = { title: "Care Priority List" };

export default async function CarePriorityPage() {
  await requireRole(["admin", "soulcareadmin"]);
  const members = await churchMembersService.listInactive();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Care Priority List</h1>
        <p className="text-sm text-muted-foreground">Inactive Members and Stewards — sorted by how long it&apos;s been since contact.</p>
      </div>
      <CarePriorityClient members={members} />
    </div>
  );
}
