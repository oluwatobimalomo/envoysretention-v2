"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "sonner";
import { assignVipAction, setVipMessagedAction } from "../actions/vip-contact-actions";
import { vipWhatsAppLink } from "../constants";
import { genderTag } from "@/features/call-pipeline/constants";
import type { EnrichedVip } from "../services/vip-contact-service";
import { cn } from "@/lib/utils";

type Filter = "unassigned" | "assigned" | "messaged" | "notmessaged" | "all";

export function VipContactClient({
  rows,
  teamMembers,
}: {
  rows: EnrichedVip[];
  teamMembers: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("unassigned");
  const [rowAssign, setRowAssign] = useState<Record<string, string>>({});

  const filtered = rows.filter((r) => {
    const matchSearch = !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search);
    if (!matchSearch) return false;
    if (filter === "unassigned") return !r.vip?.assigned_to;
    if (filter === "assigned") return !!r.vip?.assigned_to;
    if (filter === "messaged") return !!r.vip?.messaged;
    if (filter === "notmessaged") return !r.vip?.messaged;
    return true;
  });

  const assignedCount = rows.filter((r) => r.vip?.assigned_to).length;
  const messagedCount = rows.filter((r) => r.vip?.messaged).length;

  const assignOne = (id: string) => {
    const member = rowAssign[id];
    if (!member) return;
    startTransition(async () => {
      await assignVipAction(id, member);
      toast.success("Assigned.");
      setRowAssign((p) => { const n = { ...p }; delete n[id]; return n; });
      router.refresh();
    });
  };

  const setMessaged = (id: string, val: boolean) => {
    startTransition(async () => {
      await setVipMessagedAction(id, val);
      router.refresh();
    });
  };

  const sendWhatsApp = (r: EnrichedVip) => {
    const link = vipWhatsAppLink(r.full_name, r.phone);
    if (!link) { toast.error("This VIP has no valid phone number to message."); return; }
    window.open(link, "_blank");
    if (!r.vip?.messaged) setMessaged(r.id, true);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total VIPs" value={rows.length} />
        <StatCard label="Assigned" value={assignedCount} />
        <StatCard label="Messaged" value={messagedCount} />
        <StatCard label="Not Messaged" value={rows.length - messagedCount} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["unassigned", "assigned", "messaged", "notmessaged", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors",
              filter === f ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground hover:bg-accent"
            )}
          >
            {f === "notmessaged" ? "Not Messaged" : f}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-48 pl-8" />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No contacts in this category.</div>
        )}
        {filtered.map((r) => {
          const isMessaged = !!r.vip?.messaged;
          return (
            <div key={r.id} className={cn("rounded-xl border bg-card p-4", isMessaged && "border-l-4 border-l-success")}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{r.full_name}{genderTag(r.gender)}</p>
                  <p className="text-xs text-muted-foreground">{r.phone} · Service {r.service_date}</p>
                  {r.vip?.assignee_name && <p className="text-xs text-muted-foreground">Assigned to {r.vip.assignee_name}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!r.vip?.assigned_to && (
                    <>
                      <NativeSelect className="w-40" value={rowAssign[r.id] ?? ""} onChange={(e) => setRowAssign((p) => ({ ...p, [r.id]: e.target.value }))}>
                        <option value="">Assign to…</option>
                        {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                      </NativeSelect>
                      <Button size="sm" variant="outline" disabled={!rowAssign[r.id] || isPending} onClick={() => assignOne(r.id)}>Save</Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => sendWhatsApp(r)}><MessageCircle size={13} /> WhatsApp</Button>
                  <Button size="sm" variant={isMessaged ? "default" : "outline"} onClick={() => setMessaged(r.id, true)} disabled={isPending}>
                    <CheckCircle2 size={13} /> Messaged
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
