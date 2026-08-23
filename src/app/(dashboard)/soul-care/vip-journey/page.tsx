import { requireRole } from "@/features/auth/utils/require-role";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, UserPlus, MessageCircle, FileCheck, Handshake, GraduationCap } from "lucide-react";

export const metadata = { title: "VIP Journey Dashboard" };

export default async function VipJourneyPage() {
  await requireRole(["admin", "experienceadmin", "soulcareadmin"]);
  const supabase = await createClient();

  const [
    { count: totalFirstTimers },
    { count: messaged },
    { count: overviewsSubmitted },
    { count: confirmedConnectCentre },
    { count: graduatedEnvoys },
  ] = await Promise.all([
    supabase.from("first_timers").select("id", { count: "exact", head: true }),
    supabase.from("vip_message_assignments").select("id", { count: "exact", head: true }).eq("messaged", true),
    supabase.from("pipeline_overviews").select("id", { count: "exact", head: true }),
    supabase.from("connect_centre_prospects").select("id", { count: "exact", head: true }).eq("confirmed", true),
    supabase.from("potential_envoys").select("id", { count: "exact", head: true }).eq("promoted_to_membership", true),
  ]);

  const stages = [
    { label: "Registered", value: totalFirstTimers ?? 0, icon: UserPlus, desc: "First-Timers registered" },
    { label: "Welcomed", value: messaged ?? 0, icon: MessageCircle, desc: "Sent a WhatsApp welcome" },
    { label: "Overview Submitted", value: overviewsSubmitted ?? 0, icon: FileCheck, desc: "Completed the 3-week call pipeline" },
    { label: "Connect Centre", value: confirmedConnectCentre ?? 0, icon: Handshake, desc: "Confirmed in a local Connect Centre" },
    { label: "Graduated Envoy", value: graduatedEnvoys ?? 0, icon: GraduationCap, desc: "Completed Potential Envoys training" },
  ];

  const maxValue = Math.max(1, totalFirstTimers ?? 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold">VIP Journey Dashboard</h1>
        <p className="text-sm text-muted-foreground">From first hello to lasting home — where every VIP is in the retention funnel.</p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="space-y-4">
          {stages.map((stage, i) => {
            const pct = Math.round((stage.value / maxValue) * 100);
            return (
              <div key={stage.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground"><stage.icon size={13} /></div>
                    <div>
                      <p className="text-sm font-medium">{stage.label}</p>
                      <p className="text-xs text-muted-foreground">{stage.desc}</p>
                    </div>
                  </div>
                  <p className="font-display text-lg font-semibold tabular-nums">{stage.value}</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
                {i < stages.length - 1 && (
                  <div className="my-2 flex justify-center text-muted-foreground/40"><ArrowRight size={14} className="rotate-90" /></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Each stage counts everyone who has reached at least that point — not everyone continues to the next stage, since not every VIP recommends a Connect Centre or joins Potential Envoys.
      </p>
    </div>
  );
}
