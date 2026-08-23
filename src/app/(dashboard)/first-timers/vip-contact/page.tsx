import { requireRole } from "@/features/auth/utils/require-role";
import { vipContactService } from "@/features/vip-contact/services/vip-contact-service";
import { getTeamMembersByRole } from "@/lib/data/team-members";
import { VipContactClient } from "@/features/vip-contact/components/vip-contact-client";

export const metadata = { title: "VIP Contact" };

export default async function VipContactPage() {
  await requireRole(["admin", "dofficer", "experienceadmin"]);
  const [rows, teamMembers] = await Promise.all([
    vipContactService.listEnriched(),
    getTeamMembersByRole("expteam"),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">VIP Contact</h1>
        <p className="text-sm text-muted-foreground">Send a personal WhatsApp welcome message to every first-timer.</p>
      </div>
      <VipContactClient rows={rows} teamMembers={teamMembers} />
    </div>
  );
}
