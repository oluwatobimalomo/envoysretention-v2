"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Calendar, Edit3, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogVisitDialog } from "./log-visit-dialog";
import { scGenderTag } from "../constants";
import type { EnrichedContact, VisitRow } from "../services/soul-care-service";

export function MyVisitsClient({ rows, loggedBy }: { rows: EnrichedContact[]; loggedBy: string }) {
  const router = useRouter();
  const [newVisitTarget, setNewVisitTarget] = useState<EnrichedContact | null>(null);
  const [editTarget, setEditTarget] = useState<{ contact: EnrichedContact; visit: VisitRow } | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          No contacts assigned to you yet. Ask your Soul Care Admin to assign contacts.
        </div>
      )}
      {rows.map((c) => {
        const isOpen = expanded.has(c.id);
        const lastVisit = c.visits[0];
        return (
          <div key={c.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{c.full_name}{scGenderTag(c.gender)}</p>
                <p className="text-xs text-muted-foreground">{c.phone}</p>
                {lastVisit && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={11} /> Last visit: {lastVisit.visit_date ?? lastVisit.created_at.slice(0, 10)} · {lastVisit.visit_type}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {lastVisit?.escalate_to_pastorate && <Badge variant="destructive">Flagged</Badge>}
                <Button size="sm" onClick={() => setNewVisitTarget(c)}><Home size={13} /> Log Visit</Button>
              </div>
            </div>

            {c.visits.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpanded(c.id)}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {isOpen ? "Hide" : "View"} full visit history ({c.visits.length})
              </button>
            )}

            {isOpen && (
              <div className="mt-3 space-y-2 border-t pt-3">
                {c.visits.map((v) => (
                  <div key={v.id} className="rounded-lg border bg-background p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <Badge variant="outline">{v.visit_type}</Badge>
                          <Badge variant={v.visit_status === "Completed" ? "success" : "secondary"}>{v.visit_status}</Badge>
                          {v.escalate_to_pastorate && <Badge variant="destructive">Flagged</Badge>}
                          <span className="text-muted-foreground">{v.visit_date ?? v.created_at.slice(0, 10)}</span>
                        </div>
                        {v.meeting_notes && <p className="mt-1.5 text-sm">{v.meeting_notes}</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setEditTarget({ contact: c, visit: v })}>
                        <Edit3 size={12} /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {newVisitTarget && (
        <LogVisitDialog
          open
          onOpenChange={(o) => !o && setNewVisitTarget(null)}
          contactId={newVisitTarget.id}
          contactName={newVisitTarget.full_name}
          contactGender={newVisitTarget.gender}
          loggedBy={loggedBy}
          onLogged={() => { setNewVisitTarget(null); router.refresh(); }}
        />
      )}

      {editTarget && (
        <LogVisitDialog
          open
          onOpenChange={(o) => !o && setEditTarget(null)}
          contactId={editTarget.contact.id}
          contactName={editTarget.contact.full_name}
          contactGender={editTarget.contact.gender}
          loggedBy={loggedBy}
          editVisit={editTarget.visit}
          onLogged={() => { setEditTarget(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
