import { requireRole } from "@/features/auth/utils/require-role";
import { Users, PhoneForwarded, HeartHandshake, MessageSquare } from "lucide-react";
export const metadata = { title: "Overview" };
export default async function AdminOverviewPage() {
  const user = await requireRole(["admin"]);
  const stats = [
    { label: "First-Timers this month", value: "—", icon: Users },
    { label: "Calls pending", value: "—", icon: PhoneForwarded },
    { label: "Soul Care visits", value: "—", icon: HeartHandshake },
    { label: "Unread feedback", value: "—", icon: MessageSquare },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {user.fullName.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">This is a placeholder overview page — real data lands with the reporting module.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><s.icon size={18} /></div>
            <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
