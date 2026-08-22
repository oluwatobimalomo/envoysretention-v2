import { AlertTriangle, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { scGenderTag } from "../constants";
import type { VisitRow } from "../services/soul-care-service";

type FlaggedRow = VisitRow & {
  soul_care_contacts: { full_name: string; phone: string; gender: string | null } | null;
  daysOpen: number;
};

export function FlaggedList({ rows }: { rows: FlaggedRow[] }) {

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
        No visits currently flagged for pastoral attention.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const contact = r.soul_care_contacts;
        const age = r.daysOpen;
        const aging = age >= 3;
        return (
          <div key={r.id} className={`rounded-xl border bg-card p-4 ${aging ? "border-l-4 border-l-destructive" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium flex items-center gap-1.5"><Flag size={13} className="text-destructive" /> {contact?.full_name ?? "—"}{scGenderTag(contact?.gender)}</p>
                <p className="text-xs text-muted-foreground">{contact?.phone} · {r.visit_type} · {r.created_at.slice(0, 10)}</p>
                {r.escalation_reason && <p className="mt-1 text-sm">{r.escalation_reason}</p>}
              </div>
              {aging && (
                <Badge variant="destructive"><AlertTriangle size={11} /> {age} days open</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
