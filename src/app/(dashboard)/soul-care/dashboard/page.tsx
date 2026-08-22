import { requireRole } from "@/features/auth/utils/require-role";
import { createClient } from "@/lib/supabase/server";
import { Home, GraduationCap, Flag, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Soul Care Dashboard" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function SoulCareDashboardPage() {
  const user = await requireRole(["admin", "soulcareadmin"]);
  const supabase = await createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [
    { count: contactsInPool },
    { count: visitsThisMonth },
    { count: flaggedVisits },
    { count: potentialEnvoys },
    { count: graduated },
    { count: newConvertsActive },
  ] = await Promise.all([
    supabase.from("soul_care_contacts").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("soul_care_visits").select("id", { count: "exact", head: true }).gte("visit_date", monthStartStr),
    supabase.from("soul_care_visits").select("id", { count: "exact", head: true }).eq("escalate_to_pastorate", true),
    supabase.from("potential_envoys").select("id", { count: "exact", head: true }).eq("promoted_to_membership", false),
    supabase.from("potential_envoys").select("id", { count: "exact", head: true }).eq("promoted_to_membership", true),
    supabase.from("new_converts").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const stats = [
    { label: "Active contacts in pool", value: contactsInPool ?? 0, icon: Users, href: "/soul-care/queue" },
    { label: "Visits this month", value: visitsThisMonth ?? 0, icon: Home, href: "/soul-care/my-visits" },
    { label: "Flagged for pastoral", value: flaggedVisits ?? 0, icon: Flag, href: "/soul-care/flagged", warn: (flaggedVisits ?? 0) > 0 },
    { label: "Potential Envoys graduated", value: graduated ?? 0, icon: GraduationCap, href: "/soul-care/potential-envoys" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-sm font-medium text-brand-gold-foreground">{greeting()}</p>
        <h1 className="font-display text-2xl font-semibold">{user.fullName.split(" ")[0]}, here&apos;s the Soul Care snapshot</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {potentialEnvoys ?? 0} Potential Envoy{potentialEnvoys === 1 ? "" : "s"} on track · {newConvertsActive ?? 0} New Convert{newConvertsActive === 1 ? "" : "s"} being followed up
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/40">
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

      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 font-display font-medium">Quick actions</h2>
        <div className="grid gap-1 sm:grid-cols-2">
          {[
            { label: "Log a new visit", href: "/soul-care/visits/new" },
            { label: "Assign visits to the team", href: "/soul-care/assign" },
            { label: "Assign New Converts", href: "/new-converts/assign" },
            { label: "Review Potential Envoys", href: "/soul-care/potential-envoys" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center justify-between rounded-md px-2.5 py-2 text-sm hover:bg-accent">
              {l.label}
              <ArrowUpRight size={13} className="text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
