"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Download, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { exportNewConvertsCsvAction } from "../actions/new-converts-actions";
import { downloadCsv } from "@/lib/csv";

export function RegistryToolbar({ canManage }: { canManage: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [exporting, setExporting] = useState(false);
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportNewConvertsCsvAction({
        search: searchParams.get("q") ?? undefined,
        dateFrom: searchParams.get("from") ?? undefined,
        dateTo: searchParams.get("to") ?? undefined,
      });
      downloadCsv(`new-converts-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => { setSearch(e.target.value); updateParam("q", e.target.value); }} placeholder="Search name or phone…" className="pl-8" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Input type="date" className="w-auto" value={searchParams.get("from") ?? ""} onChange={(e) => updateParam("from", e.target.value)} />
        <Input type="date" className="w-auto" value={searchParams.get("to") ?? ""} onChange={(e) => updateParam("to", e.target.value)} />
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          <Download size={14} /> {exporting ? "Exporting…" : "Export CSV"}
        </Button>
        {canManage && (
          <Button size="sm" asChild><Link href="/new-converts/new"><Plus size={14} /> Add New Convert</Link></Button>
        )}
      </div>
    </div>
  );
}
