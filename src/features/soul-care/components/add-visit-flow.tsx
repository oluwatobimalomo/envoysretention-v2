"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "sonner";
import { searchContactsAction, createContactAction, type SoulCareActionState } from "../actions/soul-care-actions";
import { LogVisitDialog } from "./log-visit-dialog";
import { scGenderTag } from "../constants";
import type { ContactRow } from "../services/soul-care-service";

const initialState: SoulCareActionState & { contactId?: string } = { error: null };

export function AddVisitFlow({ loggedBy }: { loggedBy: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"search" | "new">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContactRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<ContactRow | null>(null);
  const [state, formAction, pending] = useActionState(createContactAction, initialState);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      if (!query.trim()) { setResults([]); setSearching(false); return; }
      setSearching(true);
      const found = await searchContactsAction(query);
      if (!cancelled) { setResults(found as ContactRow[]); setSearching(false); }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  useEffect(() => {
    if (state.contactId) {
      toast.success("Contact added.");
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.contactId]);

  const onSubmitNew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  };

  if (selected || state.contactId) {
    const contact = selected;
    return (
      <LogVisitDialog
        open
        onOpenChange={(o) => { if (!o) { setSelected(null); router.push("/soul-care/visits/new"); } }}
        contactId={contact?.id ?? state.contactId!}
        contactName={contact?.full_name ?? "New Contact"}
        contactGender={contact?.gender}
        loggedBy={loggedBy}
        onLogged={() => router.push("/soul-care/my-visits")}
      />
    );
  }

  if (step === "new") {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep("search")}><ArrowLeft size={16} /></Button>
          <h2 className="font-semibold flex items-center gap-2"><UserPlus size={16} /> Add New Contact</h2>
        </div>
        <form onSubmit={onSubmitNew} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input name="full_name" required placeholder="e.g. Adaeze Okafor" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number <span className="text-destructive">*</span></Label>
              <Input name="phone" required placeholder="+234 xxx xxx xxxx" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <NativeSelect name="gender" defaultValue=""><option value="">Select</option><option>Male</option><option>Female</option></NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input name="email" type="email" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Marital Status</Label>
              <NativeSelect name="marital_status" defaultValue="">
                <option value="">Select</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label>Life Stage</Label>
              <NativeSelect name="life_stage" defaultValue="">
                <option value="">Select</option><option>Student</option><option>Employee</option><option>Business Owner</option>
              </NativeSelect>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Date of Birth</Label><Input type="date" name="dob" /></div>
          <div className="space-y-1.5"><Label>House Address</Label><Input name="house_address" /></div>
          <div className="space-y-1.5"><Label>Nearest Landmark</Label><Input name="nearest_landmark" /></div>

          {state.error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Saving…" : "Save & Log Visit"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="relative">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or phone…" className="pl-9" />
      </div>
      {searching && <p className="text-sm text-muted-foreground">Searching…</p>}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div>
                <p className="text-sm font-medium">{r.full_name}{scGenderTag(r.gender)}</p>
                <p className="text-xs text-muted-foreground">{r.phone}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelected(r)}>Use this Person</Button>
            </div>
          ))}
        </div>
      )}
      {!searching && query && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No matches found.</p>
      )}
      <Button variant="outline" className="w-full" onClick={() => setStep("new")}>
        <UserPlus size={14} /> Add as New Contact
      </Button>
    </div>
  );
}
