import { requireRole } from "@/features/auth/utils/require-role";
import { churchMembersService } from "@/features/church-members/services/church-members-service";
import { MemberRegistry } from "@/features/church-members/components/member-registry";
import { cmAge } from "@/features/church-members/constants";
import { Shield, CheckCircle2, UserPlus, Heart } from "lucide-react";

export const metadata = { title: "Stewards Care" };

export default async function StewardCarePage() {
  await requireRole(["admin", "soulcareadmin"]);
  const members = await churchMembersService.listByCategory("Steward");

  const monthStart = new Date();
  monthStart.setDate(1);
  const total = members.length;
  const active = members.filter((m) => m.membership_status === "Active").length;
  const newThisMonth = members.filter((m) => new Date(m.created_at) >= monthStart).length;
  const children = members.filter((m) => { const a = cmAge(m.dob); return a !== null && a < 18; }).length;

  const stats = [
    { label: "Total Stewards", value: total, icon: Shield },
    { label: "Active Stewards", value: active, icon: CheckCircle2 },
    { label: "New This Month", value: newThisMonth, icon: UserPlus },
    { label: "Children", value: children, icon: Heart },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Stewards Care</h1>
        <p className="text-sm text-muted-foreground">Stewards registry — import from Members Care using the Category column.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"><s.icon size={15} /></div>
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <MemberRegistry members={members} />
    </div>
  );
}
