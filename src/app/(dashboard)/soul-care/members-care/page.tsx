import { requireRole } from "@/features/auth/utils/require-role";
import { churchMembersService } from "@/features/church-members/services/church-members-service";
import { MemberRegistry } from "@/features/church-members/components/member-registry";
import { MembersCareClient } from "@/features/church-members/components/members-care-client";

export const metadata = { title: "Members Care" };

export default async function MembersCarePage() {
  const user = await requireRole(["admin", "soulcareadmin"]);
  const members = await churchMembersService.listByCategory("Member");
  const isAdmin = user.role === "admin" || user.role === "soulcareadmin";

  return (
    <div className="space-y-5">
      <MembersCareClient total={members.length} isAdmin={isAdmin} />
      <MemberRegistry members={members} />
    </div>
  );
}
