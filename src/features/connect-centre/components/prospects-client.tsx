"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toggleConfirmedAction, exportProspectsCsvAction } from "../actions/connect-centre-actions";
import { CONNECT_CENTERS } from "@/features/call-pipeline/constants";
import { downloadCsv } from "@/lib/csv";
import type { ProspectRow } from "../services/connect-centre-service";
import { cn } from "@/lib/utils";

type Filter = "all" | "confirmed" | "unconfirmed";

function genderTag(g: string | null) {
  if (g === "Male") return " (M)";
  if (g === "Female") return " (F)";
  return "";
}

export function ProspectsClient({ rows }: { rows: ProspectRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [centre, setCentre] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const filtered = rows.filter((r) => {
    if (centre && r.connect_center !== centre) return false;
    if (filter === "confirmed" && !r.confirmed) return false;
    if (filter === "unconfirmed" && r.confirmed) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.full_name.toLowerCase().includes(q) && !(r.phone ?? "").includes(search)) return false;
    }
    return true;
  });

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id))));

  const handleToggleConfirmed = (r: ProspectRow) => {
    startTransition(async () => {
      await toggleConfirmedAction(r.id, !r.confirmed);
      toast.success(r.confirmed ? "Marked as not yet confirmed." : "Confirmed.");
      router.refresh();
    });
  };

  const handleExport = async () => {
    const toExport = filtered.filter((r) => selected.has(r.id));
    if (toExport.length === 0) { toast.error("Select at least one prospect first."); return; }
    setExporting(true);
    try {
      const csv = await exportProspectsCsvAction(toExport);
      const label = centre ? `_${centre.replace(/[^a-z0-9]/gi, "_")}` : "_all_centres";
      downloadCsv(`prospective_connect_members${label}_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setExporting(false);
    }
  };

  const confirmedCount = rows.filter((r) => r.confirmed).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Prospects" value={rows.length} icon={Users} />
        <StatCard label="Confirmed" value={confirmedCount} icon={CheckCircle2} />
        <StatCard label="Awaiting Confirmation" value={rows.length - confirmedCount} icon={AlertCircle} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/15 bg-accent/40 p-3">
        <NativeSelect className="w-56" value={centre} onChange={(e) => setCentre(e.target.value)}>
          <option value="">All Connect Centres</option>
          {CONNECT_CENTERS.map((c) => <option key={c} value={c}>{c}</option>)}
        </NativeSelect>
        {(["all", "unconfirmed", "confirmed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-accent"
            )}
          >
            {f === "all" ? "All" : f === "unconfirmed" ? "Awaiting" : "Confirmed"}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone…" className="w-56 pl-8" />
        </div>
        <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting || selected.size === 0}>
          <Download size={14} /> {exporting ? "Exporting…" : `Export ${selected.size > 0 ? `(${selected.size})` : ""}`}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Users className="text-muted-foreground" size={28} />
          <p className="font-medium">{rows.length === 0 ? "No Connect Centre recommendations yet." : "No prospects match your filters."}</p>
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
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} className="mt-1 size-4" />
                <div>
                  <p className="font-medium">{r.full_name}{genderTag(r.gender)}</p>
                  <p className="text-xs text-muted-foreground">{r.phone ?? "—"} · {r.life_stage ?? "—"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{r.connect_center}</Badge>
                    {(r.natural_groups ?? []).map((g) => <Badge key={g} variant="outline">{g}</Badge>)}
                  </div>
                </div>
              </label>
              {r.confirmed ? (
                <Badge variant="success"><CheckCircle2 size={11} /> Confirmed</Badge>
              ) : (
                <Button size="sm" onClick={() => handleToggleConfirmed(r)} disabled={isPending}>Mark Confirmed</Button>
              )}
              {r.confirmed && (
                <Button size="sm" variant="ghost" onClick={() => handleToggleConfirmed(r)} disabled={isPending}>Undo</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Icon size={15} /></div>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
