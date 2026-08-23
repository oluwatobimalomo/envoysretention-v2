"use client";

import { useState } from "react";
import { Search, AlertCircle, Users, Shield, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cmGenderTag } from "../constants";
import type { EnrichedMember } from "../services/church-members-service";
import { cn } from "@/lib/utils";

type PriorityMember = EnrichedMember & { lastContact: string | null; daysSince: number | null };

export function CarePriorityClient({ members }: { members: PriorityMember[] }) {
  const [search, setSearch] = useState("");

  const withUrgency = members
    .filter((m) => !search || m.full_name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search))
    .sort((a, b) => {
      if (a.daysSince === null && b.daysSince === null) return 0;
      if (a.daysSince === null) return -1;
      if (b.daysSince === null) return 1;
      return b.daysSince - a.daysSince;
    });

  const totalInactive = members.length;
  const stewardCount = members.filter((m) => m.category === "Steward").length;
  const memberCount = totalInactive - stewardCount;
  const neverContacted = withUrgency.filter((m) => m.daysSince === null).length;

  const stats = [
    { label: "Total Inactive", value: totalInactive, icon: AlertCircle },
    { label: "Inactive Members", value: memberCount, icon: Users },
    { label: "Inactive Stewards", value: stewardCount, icon: Shield },
    { label: "Never Contacted", value: neverContacted, icon: Heart },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"><s.icon size={15} /></div>
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone…" className="pl-8" />
      </div>

      {withUrgency.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">No one is currently marked Inactive.</div>
      ) : (
        <div className="space-y-2">
          {withUrgency.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 border-l-4",
                m.daysSince === null ? "border-l-destructive" : m.daysSince > 60 ? "border-l-warning" : "border-l-transparent"
              )}
            >
              <div>
                <p className="font-medium">{m.full_name}{cmGenderTag(m.gender)}</p>
                <p className="text-xs text-muted-foreground">{m.phone} · {m.category}</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {m.daysSince === null ? "Never contacted" : `${m.daysSince} day${m.daysSince !== 1 ? "s" : ""} since contact`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
