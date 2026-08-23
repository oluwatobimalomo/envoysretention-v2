"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { MembersCsvImport } from "./members-csv-import";

export function MembersCareClient({ total, isAdmin }: { total: number; isAdmin: boolean }) {
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Members Care</h1>
          <p className="text-sm text-muted-foreground">{total} member{total !== 1 ? "s" : ""} on record — Stewards are on their own page.</p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => setShowImport((s) => !s)}>
            {showImport ? <><X size={14} /> Close Import</> : <><Upload size={14} /> Bulk Import</>}
          </Button>
        )}
      </div>
      {showImport && <MembersCsvImport onDone={() => setShowImport(false)} />}
    </div>
  );
}
