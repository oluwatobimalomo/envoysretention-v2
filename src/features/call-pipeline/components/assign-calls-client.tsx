"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "sonner";
import { assignCallAction, bulkAssignCallsAction, unassignCallAction } from "../actions/call-pipeline-actions";
import { AssignmentControl } from "@/components/shared/assignment-control";
import { genderTag, pipelineComplete, type WeekRow } from "../constants";
import type { EnrichedFirstTimer } from "../services/call-pipeline-service";
import { cn } from "@/lib/utils";

type Filter = "unassigned" | "assigned" | "complete" | "incomplete";

export function AssignCallsClient({
  rows,
  teamMembers,
}: {
  rows: EnrichedFirstTimer[];
  teamMembers: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("unassigned");
  const [bulkMember, setBulkMember] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = rows.filter((r) => {
    const matchSearch = !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search);
    if (!matchSearch) return false;
    if (filter === "unassigned") return !r.assignment;
    if (filter === "assigned") return !!r.assignment;
    if (filter === "complete") return pipelineComplete(r.fbRows as WeekRow[]);
    if (filter === "incomplete") return !pipelineComplete(r.fbRows as WeekRow[]);
    return true;
  });

  const assignedCount = rows.filter((r) => r.assignment).length;
  const unassignedCount = rows.length - assignedCount;

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const bulkAssign = () => {
    if (!bulkMember) { toast.error("Select a team member first."); return; }
    const targets = filtered.filter((r) => !r.assignment && selected.has(r.id)).map((r) => r.id);
    const ids = targets.length ? targets : filtered.filter((r) => !r.assignment).map((r) => r.id);
    if (!ids.length) { toast.error("No unassigned contacts to assign."); return; }
    startTransition(async () => {
      await bulkAssignCallsAction(ids, bulkMember);
      toast.success(`Assigned ${ids.length} contact${ids.length !== 1 ? "s" : ""}.`);
      setSelected(new Set());
      router.refresh();
    });
  };

  const assignOne = (id: string, memberId: string) => {
    startTransition(async () => {
      await assignCallAction(id, memberId);
      toast.success("Assigned.");
      router.refresh();
    });
  };

  const unassignOne = (id: string) => {
    startTransition(async () => {
      await unassignCallAction(id);
      toast.success("Unassigned.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={rows.length} />
        <StatCard label="Assigned" value={assignedCount} />
        <StatCard label="Unassigned" value={unassignedCount} />
        <StatCard label="Complete" value={rows.filter((r) => pipelineComplete(r.fbRows as WeekRow[])).length} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <NativeSelect className="w-auto" value={bulkMember} onChange={(e) => setBulkMember(e.target.value)}>
          <option value="">Select team member…</option>
          {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </NativeSelect>
        <Button size="sm" onClick={bulkAssign} disabled={isPending}>
          <UserCheck size={14} /> Bulk assign {selected.size > 0 ? `(${selected.size} selected)` : "all unassigned"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["unassigned", "assigned", "complete", "incomplete"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-accent"
            )}
          >
            {f}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-48 pl-8" />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No contacts in this category.</div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <label className="flex items-center gap-3">
              {!r.assignment && (
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="size-4" />
              )}
              <div>
                <p className="font-medium">{r.full_name}{genderTag(r.gender)}</p>
                <p className="text-xs text-muted-foreground">{r.phone} · Service {r.service_date}</p>
              </div>
            </label>
            <AssignmentControl
              currentAssigneeName={r.assignment?.assignee_name ?? null}
              teamMembers={teamMembers}
              onAssign={(memberId) => assignOne(r.id, memberId)}
              onUnassign={r.assignment ? () => unassignOne(r.id) : undefined}
              pending={isPending}
            />
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
