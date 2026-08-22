"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogVisitDialog } from "./log-visit-dialog";
import { scGenderTag } from "../constants";
import type { EnrichedContact } from "../services/soul-care-service";

export function MyVisitsClient({ rows, loggedBy }: { rows: EnrichedContact[]; loggedBy: string }) {
  const router = useRouter();
  const [target, setTarget] = useState<EnrichedContact | null>(null);

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          No contacts assigned to you yet. Ask your Soul Care Admin to assign contacts.
        </div>
      )}
      {rows.map((c) => {
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
                <Button size="sm" onClick={() => setTarget(c)}><Home size={13} /> Log Visit</Button>
              </div>
            </div>
          </div>
        );
      })}

      {target && (
        <LogVisitDialog
          open
          onOpenChange={(o) => !o && setTarget(null)}
          contactId={target.id}
          contactName={target.full_name}
          contactGender={target.gender}
          loggedBy={loggedBy}
          onLogged={() => { setTarget(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
