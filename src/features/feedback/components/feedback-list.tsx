"use client";

import { useState } from "react";
import { Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { exportFeedbackCsvAction } from "../actions/feedback-actions";
import { downloadCsv } from "@/lib/csv";
import type { FeedbackEntry } from "../constants";

function genderTag(g: string | null) {
  if (g === "Male") return " (M)";
  if (g === "Female") return " (F)";
  return "";
}

export function FeedbackList({ entries, filename }: { entries: FeedbackEntry[]; filename: string }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const toggleAll = () => {
    setSelected((prev) => (prev.size === entries.length ? new Set() : new Set(entries.map((e) => e.id))));
  };

  const handleExport = async () => {
    const toExport = entries.filter((e) => selected.has(e.id));
    if (toExport.length === 0) { toast.error("Select at least one entry first."); return; }
    setExporting(true);
    try {
      const csv = await exportFeedbackCsvAction(toExport);
      downloadCsv(filename, csv);
    } finally {
      setExporting(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <MessageSquare className="text-muted-foreground" size={28} />
        <p className="font-medium">No feedback yet</p>
        <p className="text-sm text-muted-foreground">Results will show up here as they come in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" checked={selected.size === entries.length && entries.length > 0} onChange={toggleAll} className="size-4" />
          Select all ({entries.length})
        </label>
        <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting || selected.size === 0}>
          <Download size={13} /> {exporting ? "Exporting…" : `Export ${selected.size > 0 ? `(${selected.size})` : ""}`}
        </Button>
      </div>

      <div className="space-y-2">
        {entries.map((e) => (
          <label key={e.id} className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 hover:bg-accent/30">
            <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} className="mt-1 size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="font-medium">{e.display_name}{genderTag(e.gender)}</span>
                <Badge variant={e.source === "Feedback Form" ? "secondary" : "outline"}>{e.source}</Badge>
                <span className="text-xs text-muted-foreground">{e.date}</span>
              </div>
              <p className="text-sm text-muted-foreground break-words">{e.feedback}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
