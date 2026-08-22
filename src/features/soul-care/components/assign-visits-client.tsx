"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { assignContactAction, unassignContactAction, exportSoulCareCsvAction } from "../actions/soul-care-actions";
import { scGenderTag } from "../constants";
import { AssignmentControl } from "@/components/shared/assignment-control";
import { downloadCsv } from "@/lib/csv";
import type { EnrichedContact } from "../services/soul-care-service";

export function AssignVisitsClient({ rows, teamMembers }: { rows: EnrichedContact[]; teamMembers: { id: string; full_name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const filtered = rows.filter((r) => !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search));

  const assignOne = (id: string, memberId: string) => {
    startTransition(async () => {
      await assignContactAction(id, memberId);
      toast.success("Assigned.");
      router.refresh();
    });
  };

  const unassignOne = (id: string) => {
    startTransition(async () => {
      await unassignContactAction(id);
      toast.success("Unassigned.");
      router.refresh();
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportSoulCareCsvAction();
      downloadCsv(`soul-care-contacts-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-8" />
        </div>
        <Button variant="outline" size="sm" asChild><Link href="/soul-care/import"><Upload size={14} /> Import</Link></Button>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          <Download size={14} /> {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No contacts.</div>}
        {filtered.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div>
              <p className="font-medium">{c.full_name}{scGenderTag(c.gender)}</p>
              <p className="text-xs text-muted-foreground">{c.phone}</p>
            </div>
            <AssignmentControl
              currentAssigneeName={c.assignment?.assignee_name ?? null}
              teamMembers={teamMembers}
              onAssign={(memberId) => assignOne(c.id, memberId)}
              onUnassign={c.assignment ? () => unassignOne(c.id) : undefined}
              pending={isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
