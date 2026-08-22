"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function FeedbackToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => { setSearch(e.target.value); updateParam("q", e.target.value); }} placeholder="Search name or feedback…" className="pl-8" />
      </div>
      <Input type="date" className="w-auto" value={searchParams.get("from") ?? ""} onChange={(e) => updateParam("from", e.target.value)} />
      <Input type="date" className="w-auto" value={searchParams.get("to") ?? ""} onChange={(e) => updateParam("to", e.target.value)} />
    </div>
  );
}
