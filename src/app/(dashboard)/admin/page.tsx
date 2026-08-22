import { requireRole } from "@/features/auth/utils/require-role";
import { createClient } from "@/lib/supabase/server";
import { Users, PhoneForwarded, HeartHandshake, Flag, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Overview" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminOverviewPage() {
  const user = await requireRole(["admin"]);
  const supabase = await createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [
    { count: firstTimersThisMonth },
    { count: assignedCalls },
    { count: soulCareVisitsThisMonth },
    { count: flaggedCalls },
    { count: flaggedVisits },
  ] = await Promise.all([
    supabase.from("first_timers").select("id", { count: "exact", head: true }).gte("service_date", monthStartStr),
    supabase.from("call_assignments").select("id", { count: "exact", head: true }),
    supabase.from("soul_care_visits").select("id", { count: "exact", head: true }).gte("visit_date", monthStartStr),
    supabase.from("call_feedback").select("id", { count: "exact", head: true }).eq("flagged_for_pastoral", true),
    supabase.from("soul_care_visits").select("id", { count: "exact", head: true }).eq("escalate_to_pastorate", true),
  ]);

  const flaggedTotal = (flaggedCalls ?? 0) + (flaggedVisits ?? 0);

  const stats = [
    { label: "First-Timers this month", value: firstTimersThisMonth ?? 0, icon: Users, href: "/first-timers" },
    { label: "Calls assigned", value: assignedCalls ?? 0, icon: PhoneForwarded, href: "/experience/assign-calls" },
    { label: "Soul Care visits this month", value: soulCareVisitsThisMonth ?? 0, icon: HeartHandshake, href: "/soul-care/queue" },
    { label: "Flagged for pastoral", value: flaggedTotal, icon: Flag, href: "/soul-care/flagged", warn: flaggedTotal > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-sm font-medium text-brand-gold-foreground">{greeting()}</p>
        <h1 className="font-display text-2xl font-semibold">{user.fullName.split(" ")[0]}, here&apos;s what&apos;s happening</h1>
        <p className="mt-1 text-sm text-muted-foreground">A snapshot of activity across the church this month.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex size-9 items-center justify-center rounded-lg ${s.warn ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}>
                <s.icon size={18} />
              </div>
              <ArrowUpRight size={14} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="font-display text-2xl font-semibold tabular-nums">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickLinks
          title="First-Timers"
          links={[
            { label: "Add a record", href: "/first-timers/new" },
            { label: "Assign calls", href: "/experience/assign-calls" },
            { label: "VIP Contact (WhatsApp)", href: "/first-timers/vip-contact" },
          ]}
        />
        <QuickLinks
          title="Soul Care"
          links={[
            { label: "Log a visit", href: "/soul-care/visits/new" },
            { label: "Assign visits", href: "/soul-care/assign" },
            { label: "Potential Envoys", href: "/soul-care/potential-envoys" },
          ]}
        />
      </div>
    </div>
  );
}

function QuickLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 font-display font-medium">{title}</h2>
      <div className="space-y-1">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center justify-between rounded-md px-2.5 py-2 text-sm hover:bg-accent">
            {l.label}
            <ArrowUpRight size={13} className="text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
