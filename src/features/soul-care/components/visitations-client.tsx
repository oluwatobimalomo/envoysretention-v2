"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { VISIT_STATUS_OPTIONS, scGenderTag } from "../constants";
import type { VisitRow } from "../services/soul-care-service";

type Row = VisitRow & { soul_care_contacts: { full_name: string; phone: string; gender: string | null; marital_status: string | null; life_stage: string | null } | null };

export function VisitationsClient({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = rows.filter((r) => {
    if (status && r.visit_status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.soul_care_contacts?.full_name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name…" className="pl-8" />
        </div>
        <NativeSelect className="w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {VISIT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </NativeSelect>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Home className="text-muted-foreground" size={28} />
          <p className="text-sm text-muted-foreground">No visits match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => {
            const isOpen = expanded === v.id;
            const contact = v.soul_care_contacts;
            return (
              <div key={v.id} className="rounded-xl border bg-card p-4">
                <button type="button" onClick={() => setExpanded(isOpen ? null : v.id)} className="flex w-full flex-wrap items-center justify-between gap-3 text-left">
                  <div>
                    <p className="font-medium">{contact?.full_name ?? "—"}{scGenderTag(contact?.gender)}</p>
                    <p className="text-xs text-muted-foreground">{contact?.phone} · {v.visit_type} · {v.visit_date ?? v.created_at.slice(0, 10)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={v.visit_status === "Completed" ? "success" : "secondary"}>{v.visit_status}</Badge>
                    {v.escalate_to_pastorate && <Badge variant="destructive">Flagged</Badge>}
                    {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 space-y-1.5 border-t pt-3 text-sm">
                    <p className="text-xs text-muted-foreground">Logged by {v.logged_by ?? "—"}</p>
                    {v.reason_for_care && <p><strong>Reason:</strong> {v.reason_for_care}</p>}
                    {v.meeting_notes && <p className="text-muted-foreground">{v.meeting_notes}</p>}
                    {v.prayer_requests && <p className="text-success"><strong>Prayer:</strong> {v.prayer_requests}</p>}
                    {v.testimony && <p className="text-brand-gold-foreground"><strong>Testimony:</strong> {v.testimony}</p>}
                    {v.material_support && v.material_support_notes && <p><strong>Support given:</strong> {v.material_support_notes}</p>}
                    {v.follow_up_required && v.next_follow_up_date && <p className="text-warning">Follow-up: {v.next_follow_up_date}</p>}
                    {v.escalate_to_pastorate && v.escalation_reason && (
                      <p className="rounded-md bg-destructive/10 px-3 py-2 text-destructive">🚩 {v.escalation_reason}</p>
                    )}
                    {v.visit_photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.visit_photo_url} alt="Visit" className="mt-2 h-24 w-32 cursor-pointer rounded-lg border object-cover" onClick={() => window.open(v.visit_photo_url!, "_blank")} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
