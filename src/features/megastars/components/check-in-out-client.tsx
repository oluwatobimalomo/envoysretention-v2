"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, CheckCircle, Download, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { searchFamiliesAction, checkInAction, checkOutAction, exportAttendanceAction } from "../actions/megastars-actions";
import { AddMegastarDialog } from "./add-megastar-dialog";
import { downloadCsv } from "@/lib/csv";
import type { FamilyResult, EnrichedCheckin, ServiceRow } from "../services/megastars-service";
import { cn } from "@/lib/utils";

export function CheckInOutClient({ service, activeList }: { service: ServiceRow | null; activeList: EnrichedCheckin[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"checkin" | "checkout">("checkin");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FamilyResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({}); // childId -> guardianId
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      if (mode !== "checkin" || !search.trim()) { setResults([]); setSearching(false); return; }
      setSearching(true);
      const families = await searchFamiliesAction(search);
      if (!cancelled) { setResults(families); setSearching(false); }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [search, mode]);

  const toggleChild = (childId: string, guardianId: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[childId]) delete next[childId]; else next[childId] = guardianId;
      return next;
    });
  };

  const confirmCheckIn = () => {
    if (!service) { toast.error("No open service — ask a Megastars Admin to open one."); return; }
    const entries = Object.entries(selected).map(([childId, guardianId]) => ({ childId, guardianId }));
    if (!entries.length) { toast.error("Select at least one child."); return; }
    startTransition(async () => {
      await checkInAction(service.id, entries);
      toast.success(`${entries.length} child${entries.length !== 1 ? "ren" : ""} checked in.`);
      setSelected({}); setResults([]); setSearch("");
      router.refresh();
    });
  };

  const handleCheckOut = (row: EnrichedCheckin) => {
    startTransition(async () => {
      await checkOutAction(row.id, row.guardian_id);
      toast.success(`${row.child_name ?? "Child"} checked out.`);
      router.refresh();
    });
  };

  const handleExport = async () => {
    if (!service) return;
    setExporting(true);
    try {
      const csv = await exportAttendanceAction(service.id);
      downloadCsv(`megastars_attendance_${service.label.replace(/[^a-z0-9]/gi, "_")}_${service.service_date}.csv`, csv);
    } finally {
      setExporting(false);
    }
  };

  const checkoutMatches = mode === "checkout" && search.trim()
    ? activeList.filter((r) => {
        const q = search.trim().toLowerCase();
        return r.child_name?.toLowerCase().includes(q) || r.guardian_name?.toLowerCase().includes(q) || r.guardian_phone?.includes(search);
      })
    : activeList;

  return (
    <div className="space-y-5">
      {!service ? (
        <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
          <AlertCircle size={16} className="text-warning" />
          No service is currently open. Ask a Megastars Admin to open one from the Services page before checking children in.
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
          <div>
            <span className="text-sm font-semibold text-success">{service.label}</span>
            <span className="ml-2.5 text-xs text-muted-foreground">{service.service_date} · {activeList.length} currently checked in</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleExport} disabled={exporting}>
            <Download size={13} /> Download Attendance
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant={mode === "checkin" ? "default" : "ghost"} onClick={() => { setMode("checkin"); setSearch(""); setResults([]); }}>
          <UserPlus size={14} /> Check In
        </Button>
        <Button variant={mode === "checkout" ? "default" : "ghost"} onClick={() => { setMode("checkout"); setSearch(""); }}>
          <CheckCircle size={14} /> Check Out
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guardian phone or name, or child's name…"
            className="pl-9"
          />
        </div>
        {mode === "checkin" && (
          <Button variant="outline" onClick={() => setShowAddDialog(true)}><UserPlus size={14} /> Add New</Button>
        )}
      </div>

      {mode === "checkin" && (
        <div className="space-y-3">
          {searching && <p className="text-sm text-muted-foreground">Searching…</p>}
          {results.map((fam) => (
            <div key={fam.guardian.id} className="rounded-xl border bg-card p-4">
              <p className="mb-2 text-sm font-medium">{fam.guardian.full_name} · <span className="text-muted-foreground">{fam.guardian.phone}</span></p>
              <div className="grid gap-2 sm:grid-cols-2">
                {fam.children.map((child) => {
                  const checked = !!selected[child.id];
                  const isMatch = fam.matchedChildIds.has(child.id);
                  return (
                    <label key={child.id} className={cn("flex items-center gap-2 rounded-lg border p-2.5 text-sm cursor-pointer", checked && "border-primary bg-accent", isMatch && !checked && "border-primary/40")}>
                      <input type="checkbox" checked={checked} onChange={() => toggleChild(child.id, fam.guardian.id)} className="size-4" />
                      <div>
                        <p className="font-medium">{child.full_name}</p>
                        <p className="text-xs text-muted-foreground">{child.class ?? "No class"}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(selected).length > 0 && (
            <Button onClick={confirmCheckIn} disabled={isPending} className="w-full">
              {isPending ? "Checking in…" : `Check In ${Object.keys(selected).length} Child${Object.keys(selected).length !== 1 ? "ren" : ""}`}
            </Button>
          )}
        </div>
      )}

      {mode === "checkout" && (
        <div className="space-y-2">
          {checkoutMatches.length === 0 && <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No one currently checked in.</div>}
          {checkoutMatches.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
              <div>
                <p className="font-medium">{row.child_name}</p>
                <p className="text-xs text-muted-foreground">{row.child_class ?? "—"} · Dropped off by {row.guardian_name}</p>
                <p className="text-xs text-muted-foreground">Checked in {new Date(row.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleCheckOut(row)} disabled={isPending}><CheckCircle size={13} /> Check Out</Button>
            </div>
          ))}
        </div>
      )}

      <AddMegastarDialog open={showAddDialog} onOpenChange={setShowAddDialog} onDone={() => router.refresh()} />
    </div>
  );
}
