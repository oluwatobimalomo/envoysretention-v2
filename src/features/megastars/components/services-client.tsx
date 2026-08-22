"use client";

import { startTransition, useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { openServiceAction, closeServiceAction, type MegastarActionState } from "../actions/megastars-actions";
import type { ServiceRow } from "../services/megastars-service";

const initialState: MegastarActionState = { error: null };

export function ServicesClient({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(openServiceAction, initialState);
  const [isClosing, startClosing] = useTransition();

  useEffect(() => {
    if (!pending && !state.error && state !== initialState) {
      router.refresh();
    }
  }, [pending, state, router]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
    (e.currentTarget as HTMLFormElement).reset();
  };

  const handleClose = (svc: ServiceRow) => {
    if (!confirm(`Close "${svc.label}"? Anyone still checked in will need to be checked out manually.`)) return;
    startClosing(async () => {
      await closeServiceAction(svc.id);
      toast.success("Service closed.");
      router.refresh();
    });
  };

  const openOnes = services.filter((s) => s.status === "Open");

  return (
    <div className="space-y-5">
      {openOnes.length > 0 && (
        <p className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
          {openOnes.length} service{openOnes.length !== 1 ? "s are" : " is"} currently open.
        </p>
      )}

      <div className="rounded-xl border bg-accent/30 p-5">
        <p className="mb-3 text-sm font-semibold">Open a New Service</p>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input name="label" defaultValue="Sunday Service" required />
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" name="service_date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </div>
          <Button type="submit" disabled={pending} className="self-end">
            {pending && <Loader2 className="animate-spin" />}
            <UserPlus size={14} /> Open Service
          </Button>
        </form>
        {state.error && <p className="mt-2 text-sm text-destructive">{state.error}</p>}
      </div>

      <div className="space-y-2">
        {services.map((svc) => (
          <div key={svc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div>
              <p className="font-medium">{svc.label}</p>
              <p className="text-xs text-muted-foreground">{svc.service_date}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={svc.status === "Open" ? "success" : "outline"}>{svc.status}</Badge>
              {svc.status === "Open" && (
                <Button size="sm" variant="outline" onClick={() => handleClose(svc)} disabled={isClosing}>Close</Button>
              )}
            </div>
          </div>
        ))}
        {services.length === 0 && <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">No services yet.</div>}
      </div>
    </div>
  );
}
