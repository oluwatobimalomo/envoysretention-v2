"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function ReportDateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const hasFilter = searchParams.get("from") || searchParams.get("to");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input type="date" className="w-auto" value={searchParams.get("from") ?? ""} onChange={(e) => updateParam("from", e.target.value)} />
      <span className="text-sm text-muted-foreground">to</span>
      <Input type="date" className="w-auto" value={searchParams.get("to") ?? ""} onChange={(e) => updateParam("to", e.target.value)} />
      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={() => { updateParam("from", ""); updateParam("to", ""); }}>
          <X size={12} /> Clear
        </Button>
      )}
    </div>
  );
}
