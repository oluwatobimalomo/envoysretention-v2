"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, X, CheckCircle2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { setMemberStatusAction, addMemberToPoolAction } from "../actions/church-members-actions";
import { cmAge, cmGenderTag, MC_STATUS_META } from "../constants";
import type { EnrichedMember } from "../services/church-members-service";

export function MemberRegistry({ members }: { members: EnrichedMember[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fMarital, setFMarital] = useState("");
  const [fLife, setFLife] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const filtered = members.filter((m) => {
    if (search && !m.full_name.toLowerCase().includes(search.toLowerCase()) && !m.phone.includes(search)) return false;
    if (fStatus && m.membership_status !== fStatus) return false;
    if (fMarital && m.marital_status !== fMarital) return false;
    if (fLife && m.life_stage !== fLife) return false;
    return true;
  });

  const toggleStatus = (m: EnrichedMember) => {
    const next = m.membership_status === "Active" ? "Inactive" : "Active";
    startTransition(async () => {
      await setMemberStatusAction(m.id, next);
      toast.success(`${m.full_name} marked ${next}.`);
      router.refresh();
    });
  };

  const addToPool = (m: EnrichedMember) => {
    setAddingId(m.id);
    startTransition(async () => {
      try {
        await addMemberToPoolAction(m);
        toast.success(`${m.full_name} added to the visit pool.`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't add to pool.");
      } finally {
        setAddingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold-light p-3">
        <Filter size={14} className="shrink-0 text-brand-gold-foreground" />
        <NativeSelect className="w-44" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">Membership Status</option>
          <option>Active</option><option>Inactive</option><option>Travelled</option>
        </NativeSelect>
        <NativeSelect className="w-44" value={fMarital} onChange={(e) => setFMarital(e.target.value)}>
          <option value="">Marital Status</option>
          <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
        </NativeSelect>
        <NativeSelect className="w-44" value={fLife} onChange={(e) => setFLife(e.target.value)}>
          <option value="">Life Stage</option>
          <option>Student</option><option>Employee</option><option>Business Owner</option>
        </NativeSelect>
        {(fStatus || fMarital || fLife) && (
          <Button variant="ghost" size="sm" onClick={() => { setFStatus(""); setFMarital(""); setFLife(""); }}>
            <X size={12} /> Clear
          </Button>
        )}
        <div className="relative ml-auto">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone…" className="w-56 pl-8" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          {members.length === 0 ? "No records yet." : "No one matches your filters."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => {
            const age = cmAge(m.dob);
            return (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
                <div>
                  <p className="font-medium">{m.full_name}{cmGenderTag(m.gender)}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.phone} {age !== null ? `· Age ${age}` : ""} {m.life_stage ? `· ${m.life_stage}` : ""}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {m.lastVisit && <span>Last visit: {m.lastVisit}</span>}
                    {m.lastCall && <span>Last call: {m.lastCall}</span>}
                    {!m.lastVisit && !m.lastCall && <span>No recorded contact</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(m)} disabled={isPending}>
                    <Badge variant={MC_STATUS_META[m.membership_status] ?? "outline"}>{m.membership_status}</Badge>
                  </button>
                  {m.inPool ? (
                    <Badge variant="success"><CheckCircle2 size={11} /> In Pool</Badge>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => addToPool(m)} disabled={addingId === m.id}>
                      <UserPlus size={12} /> {addingId === m.id ? "Adding…" : "Add to Pool"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {members.length}. Click a status badge to toggle Active/Inactive.
        </p>
      )}
    </div>
  );
}
