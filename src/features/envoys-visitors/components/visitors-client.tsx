"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, RotateCcw, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { restoreVisitorAction, exportVisitorsCsvAction } from "../actions/envoys-visitors-actions";
import { downloadCsv } from "@/lib/csv";
import { genderTag } from "@/features/call-pipeline/constants";
import type { EnvoysVisitorRow } from "../services/envoys-visitors-service";

export function VisitorsClient({ rows }: { rows: EnvoysVisitorRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const filtered = rows.filter((r) => !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || (r.phone ?? "").includes(search));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id))));

  const handleRestore = (r: EnvoysVisitorRow) => {
    if (!confirm(`Restore ${r.full_name} to the active call pipeline? They'll need a fresh VIP Retention Overview.`)) return;
    startTransition(async () => {
      await restoreVisitorAction(r.id, r.original_first_timer_id);
      toast.success(`${r.full_name} restored to the active pipeline.`);
      router.refresh();
    });
  };

  const handleExport = async () => {
    const toExport = filtered.filter((r) => selected.has(r.id));
    if (toExport.length === 0) { toast.error("Select at least one row first."); return; }
    setExporting(true);
    try {
      const csv = await exportVisitorsCsvAction(toExport);
      downloadCsv(`envoys_visitors_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Visitors" value={rows.length} />
        <StatCard label="Matching Search" value={filtered.length} />
        <StatCard label="Selected" value={selected.size} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone…" className="pl-8" />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || selected.size === 0}>
          <Download size={13} /> {exporting ? "Exporting…" : `Export ${selected.size > 0 ? `(${selected.size})` : ""}`}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Users className="text-muted-foreground" size={28} />
          <p className="text-sm text-muted-foreground">{rows.length === 0 ? "No one archived here yet." : "No one matches your search."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="size-4" />
            Select all ({filtered.length})
          </label>
          {filtered.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
              <label className="flex flex-1 items-start gap-3">
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="mt-1 size-4" />
                <div>
                  <p className="font-medium">{r.full_name}{genderTag(r.gender)}</p>
                  <p className="text-xs text-muted-foreground">{r.phone ?? "—"} {r.life_stage ? `· ${r.life_stage}` : ""}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(r.natural_groups ?? []).map((g) => <Badge key={g} variant="outline">{g}</Badge>)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Moved {r.moved_at.slice(0, 10)}</p>
                </div>
              </label>
              {r.restored_at ? (
                <Badge variant="success">Restored {r.restored_at.slice(0, 10)}</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => handleRestore(r)} disabled={isPending}>
                  <RotateCcw size={13} /> Restore
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
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
