import { requireRole } from "@/features/auth/utils/require-role";
import { soulCareService } from "@/features/soul-care/services/soul-care-service";
import { FlaggedList } from "@/features/soul-care/components/flagged-list";

export const metadata = { title: "Flagged Visits" };

export default async function SoulCareFlaggedPage() {
  await requireRole(["admin", "soulcareadmin", "soulcareteam"]);
  const rows = await soulCareService.listFlagged();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Flagged for Pastoral</h1>
        <p className="text-sm text-muted-foreground">{rows.length} visit{rows.length !== 1 ? "s" : ""} escalated by the Soul Care team</p>
      </div>
      <FlaggedList rows={rows} />
    </div>
  );
}
