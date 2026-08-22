"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { exportCompletedPipelinesCsvAction } from "../actions/call-pipeline-actions";
import { downloadCsv } from "@/lib/csv";

export function CompletedToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [exporting, setExporting] = useState(false);
  const [, startTransition] = useTransition();

  const updateParam = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value); else params.delete("q");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportCompletedPipelinesCsvAction({ search: searchParams.get("q") ?? undefined });
      downloadCsv(`completed-pipelines-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => { setSearch(e.target.value); updateParam(e.target.value); }} placeholder="Search name or caller…" className="pl-8" />
      </div>
      <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
        <Download size={14} /> {exporting ? "Exporting…" : "Export CSV"}
      </Button>
    </div>
  );
}
