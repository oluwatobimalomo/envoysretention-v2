import { requireRole } from "@/features/auth/utils/require-role";
import { AddVisitFlow } from "@/features/soul-care/components/add-visit-flow";

export const metadata = { title: "Add Visit" };

export default async function AddVisitPage() {
  const user = await requireRole(["admin", "soulcareadmin", "soulcareteam"]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Log New Visit</h1>
        <p className="text-sm text-muted-foreground">Search for an existing contact or add a new one, then log the visit.</p>
      </div>
      <AddVisitFlow loggedBy={user.fullName} />
    </div>
  );
}
