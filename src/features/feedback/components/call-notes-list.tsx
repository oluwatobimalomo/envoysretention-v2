"use client";

import { useState } from "react";
import { Search, MessagesSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { normaliseStatus, genderTag } from "@/features/call-pipeline/constants";
import type { CallFeedbackRow } from "../services/feedback-service";

type Row = CallFeedbackRow & { first_timers: { full_name: string; phone: string; gender: string | null } | null };

export function CallNotesList({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((r) => !search || r.first_timers?.full_name?.toLowerCase().includes(search.toLowerCase()) || r.notes?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-8" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <MessagesSquare className="text-muted-foreground" size={28} />
          <p className="text-sm text-muted-foreground">No call notes yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const norm = normaliseStatus(r.call_status);
            return (
              <div key={r.id} className="rounded-xl border bg-card p-4">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="font-medium">{r.first_timers?.full_name ?? "—"}{genderTag(r.first_timers?.gender)}</span>
                  <Badge variant={norm === "Reached" ? "success" : norm === "Incorrect Contact" ? "destructive" : "warning"}>Week {r.week_number} · {r.call_status}</Badge>
                  <span className="text-xs text-muted-foreground">{r.created_at.slice(0, 10)}</span>
                  {r.flagged_for_pastoral && <Badge variant="destructive">Flagged</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{r.notes}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
