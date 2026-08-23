import { requireRole } from "@/features/auth/utils/require-role";
import { megastarsService } from "@/features/megastars/services/megastars-service";
import { RosterClient } from "@/features/megastars/components/roster-client";

export const metadata = { title: "Megastars Roster" };

export default async function MegastarsRosterPage() {
  const user = await requireRole(["admin", "dofficer", "megastars", "megastarsadmin"]);
  const rows = await megastarsService.listRoster();
  const isAdmin = user.role === "admin" || user.role === "megastarsadmin";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Megastars Roster</h1>
        <p className="text-sm text-muted-foreground">{rows.filter((r) => r.is_active).length} children currently active</p>
      </div>
      <RosterClient rows={rows} isAdmin={isAdmin} />
    </div>
  );
}
