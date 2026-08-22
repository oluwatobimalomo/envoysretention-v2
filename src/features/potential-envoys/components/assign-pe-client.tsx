"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, UserCheck, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { assignPeAction, bulkAssignPeAction } from "../actions/pe-actions";
import { peComplete } from "../constants";
import { genderTag } from "@/features/call-pipeline/constants";
import type { EnrichedPotentialEnvoy } from "../services/potential-envoys-service";
import { cn } from "@/lib/utils";

type Filter = "unassigned" | "assigned" | "graduated" | "active";

export function AssignPeClient({ rows, teamMembers }: { rows: EnrichedPotentialEnvoy[]; teamMembers: { id: string; full_name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("unassigned");
  const [bulkMember, setBulkMember] = useState("");
  const [rowAssign, setRowAssign] = useState<Record<string, string>>({});

  const filtered = rows.filter((r) => {
    const matchSearch = !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search);
    if (!matchSearch) return false;
    if (filter === "unassigned") return !r.assignment;
    if (filter === "assigned") return !!r.assignment;
    if (filter === "graduated") return r.promoted_to_membership;
    if (filter === "active") return !r.promoted_to_membership;
    return true;
  });

  const bulkAssign = () => {
    if (!bulkMember) { toast.error("Select a team member first."); return; }
    const ids = rows.filter((r) => !r.assignment).map((r) => r.id);
    if (!ids.length) { toast.error("No unassigned Potential Envoys."); return; }
    startTransition(async () => {
      await bulkAssignPeAction(ids, bulkMember);
      toast.success(`Assigned ${ids.length}.`);
      router.refresh();
    });
  };

  const assignOne = (id: string) => {
    const member = rowAssign[id];
    if (!member) return;
    startTransition(async () => {
      await assignPeAction(id, member);
      toast.success("Assigned.");
      setRowAssign((p) => { const n = { ...p }; delete n[id]; return n; });
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={rows.length} />
        <StatCard label="Assigned" value={rows.filter((r) => r.assignment).length} />
        <StatCard label="Graduated" value={rows.filter((r) => r.promoted_to_membership).length} />
        <StatCard label="5 Weeks Complete" value={rows.filter((r) => peComplete(r.fbRows)).length} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <NativeSelect className="w-auto" value={bulkMember} onChange={(e) => setBulkMember(e.target.value)}>
          <option value="">Select team member…</option>
          {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </NativeSelect>
        <Button size="sm" onClick={bulkAssign} disabled={isPending}><UserCheck size={14} /> Bulk assign all unassigned</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["unassigned", "assigned", "active", "graduated"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-accent")}>
            {f}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-48 pl-8" />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No Potential Envoys in this category.</div>}
        {filtered.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div>
              <p className="font-medium flex items-center gap-1.5">{r.full_name}{genderTag(r.gender)} {r.promoted_to_membership && <GraduationCap size={13} className="text-success" />}</p>
              <p className="text-xs text-muted-foreground">{r.phone}</p>
            </div>
            {r.assignment ? (
              <Badge variant="secondary">Assigned to {r.assignment.assignee_name ?? "—"}</Badge>
            ) : (
              <div className="flex items-center gap-2">
                <NativeSelect className="w-40" value={rowAssign[r.id] ?? ""} onChange={(e) => setRowAssign((p) => ({ ...p, [r.id]: e.target.value }))}>
                  <option value="">Assign to…</option>
                  {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </NativeSelect>
                <Button size="sm" variant="outline" disabled={!rowAssign[r.id] || isPending} onClick={() => assignOne(r.id)}>Save</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
