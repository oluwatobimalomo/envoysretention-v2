"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, RotateCcw, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { removeFromRosterAction, restoreToRosterAction } from "../actions/megastars-actions";
import { AddMegastarDialog } from "./add-megastar-dialog";
import { MEGASTAR_CLASSES, megastarAge, suggestPromotion } from "../constants";
import type { MegastarRow } from "../services/megastars-service";

type RosterRow = MegastarRow & { guardians: { full_name: string; phone: string }[] };

export function RosterClient({ rows, isAdmin }: { rows: RosterRow[]; isAdmin: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [showRemoved, setShowRemoved] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filtered = rows.filter((r) => {
    if (showRemoved ? r.is_active : !r.is_active) return false;
    if (search && !r.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (classFilter && r.class !== classFilter) return false;
    return true;
  });

  const handleRemove = (child: MegastarRow) => {
    const reason = prompt(`Reason for removing ${child.full_name} (e.g. "Moved away", "Family left church")`, "");
    if (reason === null) return;
    startTransition(async () => {
      await removeFromRosterAction(child.id, reason);
      toast.success(`${child.full_name} removed from the active roster.`);
      router.refresh();
    });
  };

  const handleRestore = (child: MegastarRow) => {
    startTransition(async () => {
      await restoreToRosterAction(child.id);
      toast.success(`${child.full_name} restored to the active roster.`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-8" />
        </div>
        <NativeSelect className="w-auto" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All classes</option>
          {MEGASTAR_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </NativeSelect>
        <Button variant={showRemoved ? "default" : "outline"} size="sm" onClick={() => setShowRemoved((s) => !s)}>
          {showRemoved ? "Showing Removed" : "Show Removed"}
        </Button>
        <Button size="sm" onClick={() => setShowAddDialog(true)}><UserPlus size={14} /> Add Megastar</Button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            {showRemoved ? "No removed children." : "No children match your filters."}
          </div>
        )}
        {filtered.map((c) => {
          const age = megastarAge(c.dob);
          const promote = suggestPromotion(c.dob, c.class);
          const isRemoved = !c.is_active;
          return (
            <div key={c.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-4" style={{ opacity: isRemoved ? 0.65 : 1 }}>
              <div>
                <p className="font-medium">{c.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.gender ?? "—"} · {age !== null ? `Age ${age}` : "DOB not set"} · {c.class ?? "No class"}
                </p>
                <p className="mt-0.5 text-xs text-primary">
                  {c.guardians.length ? c.guardians.map((g) => g.full_name).join(", ") : "No guardian linked"}
                </p>
                {isRemoved && (
                  <p className="mt-0.5 text-xs text-destructive">
                    Removed {c.removed_at?.slice(0, 10)}{c.removed_reason ? ` — ${c.removed_reason}` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {promote && !isRemoved && <Badge variant="warning">Consider promoting class</Badge>}
                {isAdmin && (
                  isRemoved ? (
                    <Button size="sm" variant="outline" onClick={() => handleRestore(c)} disabled={isPending}><RotateCcw size={13} /> Restore</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleRemove(c)} disabled={isPending}><UserX size={13} /> Remove</Button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddMegastarDialog open={showAddDialog} onOpenChange={setShowAddDialog} onDone={() => router.refresh()} />
    </div>
  );
}
