"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { assignContactAction } from "../actions/soul-care-actions";
import { scGenderTag } from "../constants";
import type { EnrichedContact } from "../services/soul-care-service";

export function AssignVisitsClient({ rows, teamMembers }: { rows: EnrichedContact[]; teamMembers: { id: string; full_name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [rowAssign, setRowAssign] = useState<Record<string, string>>({});

  const filtered = rows.filter((r) => !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search));

  const assignOne = (id: string) => {
    const member = rowAssign[id];
    if (!member) return;
    startTransition(async () => {
      await assignContactAction(id, member);
      toast.success("Assigned.");
      setRowAssign((p) => { const n = { ...p }; delete n[id]; return n; });
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-8" />
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No contacts.</div>}
        {filtered.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div>
              <p className="font-medium">{c.full_name}{scGenderTag(c.gender)}</p>
              <p className="text-xs text-muted-foreground">{c.phone}</p>
            </div>
            {c.assignment ? (
              <Badge variant="secondary">Assigned to {c.assignment.assignee_name ?? "—"}</Badge>
            ) : (
              <div className="flex items-center gap-2">
                <NativeSelect className="w-40" value={rowAssign[c.id] ?? ""} onChange={(e) => setRowAssign((p) => ({ ...p, [c.id]: e.target.value }))}>
                  <option value="">Assign to…</option>
                  {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </NativeSelect>
                <Button size="sm" variant="outline" disabled={!rowAssign[c.id] || isPending} onClick={() => assignOne(c.id)}>Save</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
