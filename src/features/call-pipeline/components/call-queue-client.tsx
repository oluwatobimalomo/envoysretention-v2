"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { genderTag, normaliseStatus, pipelineComplete, type WeekRow } from "../constants";
import type { EnrichedFirstTimer } from "../services/call-pipeline-service";
import { cn } from "@/lib/utils";

type Category = "pending" | "reached" | "callback" | "incorrect" | "complete";

const CATEGORY_META: Record<Category, { label: string; variant: "outline" | "success" | "warning" | "destructive" | "secondary" }> = {
  pending: { label: "Pending", variant: "outline" },
  reached: { label: "Reached", variant: "success" },
  callback: { label: "Call Back", variant: "warning" },
  incorrect: { label: "Incorrect Contact", variant: "destructive" },
  complete: { label: "Complete", variant: "secondary" },
};

function categorise(r: EnrichedFirstTimer): Category {
  if (pipelineComplete(r.fbRows as WeekRow[])) return "complete";
  const latest = r.fbRows[r.fbRows.length - 1];
  if (!latest) return "pending";
  const norm = normaliseStatus(latest.call_status);
  if (norm === "Reached") return "reached";
  if (norm === "Call Back") return "callback";
  if (norm === "Incorrect Contact") return "incorrect";
  return "pending";
}

export function CallQueueClient({ rows }: { rows: EnrichedFirstTimer[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Category | "all">("all");

  const filtered = rows.filter((r) => {
    const matchSearch = !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search);
    if (!matchSearch) return false;
    if (filter === "all") return true;
    return categorise(r) === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "pending", "reached", "callback", "incorrect", "complete"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-accent"
            )}
          >
            {f === "all" ? "All" : CATEGORY_META[f].label}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-48 pl-8" />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">Nothing here.</div>
        )}
        {filtered.map((r) => {
          const cat = categorise(r);
          return (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
              <div>
                <p className="font-medium">{r.full_name}{genderTag(r.gender)}</p>
                <p className="text-xs text-muted-foreground">
                  {r.phone} · {r.assignment?.assignee_name ? `Assigned to ${r.assignment.assignee_name}` : "Unassigned"}
                </p>
              </div>
              <Badge variant={CATEGORY_META[cat].variant}>{CATEGORY_META[cat].label}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
