"use client";

import { useState } from "react";
import { Download, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportGoldenEnvoysCsvAction } from "../actions/reports-actions";
import { downloadCsv } from "@/lib/csv";
import type { GoldenEnvoy } from "../services/reports-service";

export function GoldenEnvoysTable({ rows }: { rows: GoldenEnvoy[] }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportGoldenEnvoysCsvAction(rows);
      downloadCsv(`new-golden-envoys-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-display font-medium">
          <Star size={15} className="text-brand-gold" /> New Golden Envoys
        </h2>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || rows.length === 0}>
          <Download size={13} /> {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No one recommended for membership in this range yet.</p>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent/50">
              <div>
                <p className="font-medium">{r.full_name}</p>
                <p className="text-xs text-muted-foreground">{r.phone} {r.connect_center ? `· ${r.connect_center}` : ""}</p>
              </div>
              <span className="text-xs text-muted-foreground">{r.submitted_at.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
