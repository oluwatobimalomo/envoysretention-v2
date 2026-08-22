"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TablePagination({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <p>Showing <strong>{(page - 1) * pageSize + 1}</strong>–<strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong></p>
      <div className="flex gap-1">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => goTo(page - 1)}><ChevronLeft size={14} /></Button>
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => goTo(page + 1)}><ChevronRight size={14} /></Button>
      </div>
    </div>
  );
}
