"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Download, Upload, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { exportFirstTimersCsvAction } from "../actions/first-timer-actions";
import { toast } from "sonner";

export function FirstTimersToolbar({ canManage }: { canManage: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [exporting, setExporting] = useState(false);
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportFirstTimersCsvAction({
        search: searchParams.get("q") ?? undefined,
        dateFrom: searchParams.get("from") ?? undefined,
        dateTo: searchParams.get("to") ?? undefined,
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `first-timers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't export right now — try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); updateParam("q", e.target.value); }}
          placeholder="Search name or phone…"
          className="pl-8"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Input type="date" className="w-auto" value={searchParams.get("from") ?? ""} onChange={(e) => updateParam("from", e.target.value)} />
        <Input type="date" className="w-auto" value={searchParams.get("to") ?? ""} onChange={(e) => updateParam("to", e.target.value)} />
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          <Download size={14} /> {exporting ? "Exporting…" : "Export CSV"}
        </Button>
        {canManage && (
          <>
            <Button variant="outline" size="sm" asChild><Link href="/first-timers/import"><Upload size={14} /> Import</Link></Button>
            <Button size="sm" asChild><Link href="/first-timers/new"><Plus size={14} /> Add First-Timer</Link></Button>
          </>
        )}
      </div>
    </div>
  );
}
