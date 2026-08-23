"use client";

import { useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { bulkImportMembersAction } from "../actions/church-members-actions";

const HEADERS = ["full_name", "phone", "email", "gender", "dob", "marital_status", "life_stage", "category", "membership_status", "house_address", "nearest_landmark"];
const EXAMPLE = ["Adaeze Okafor", "08031234567", "adaeze@example.com", "Female", "1994-03-12", "Married", "Employee", "Member", "Active", "12 Palm Street Ikeja", "Near Chevron Roundabout"];

type Row = Record<string, string>;

export function MembersCsvImport({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);

  const downloadTemplate = () => {
    const csv = [HEADERS.join(","), EXAMPLE.join(",")].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "church-members-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    Papa.parse<Row>(file, { header: true, skipEmptyLines: true, complete: (r) => setRows(r.data) });
  };

  const oneOf = <T extends string>(v: string | undefined, options: readonly T[]): T | null =>
    options.includes((v ?? "") as T) ? (v as T) : null;

  const valid = rows
    .map((r) => ({
      full_name: (r.full_name ?? "").trim(),
      phone: (r.phone ?? "").trim(),
      email: r.email?.trim() || null,
      gender: oneOf(r.gender, ["Male", "Female"] as const),
      dob: r.dob?.trim() || null,
      marital_status: oneOf(r.marital_status, ["Single", "Married", "Divorced", "Widowed"] as const),
      life_stage: oneOf(r.life_stage, ["Student", "Employee", "Business Owner"] as const),
      category: oneOf(r.category, ["Steward", "Member"] as const) ?? "Member",
      membership_status: oneOf(r.membership_status, ["Active", "Inactive", "Travelled"] as const) ?? "Active",
      house_address: r.house_address?.trim() || null,
      nearest_landmark: r.nearest_landmark?.trim() || null,
    }))
    .filter((r) => r.full_name && r.phone);

  const invalidCount = rows.length - valid.length;

  const handleImport = async () => {
    if (valid.length === 0) return;
    setImporting(true);
    try {
      const count = await bulkImportMembersAction(valid);
      toast.success(`Imported ${count} record${count !== 1 ? "s" : ""}.`);
      router.refresh();
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mb-5 space-y-4 rounded-xl border border-primary/20 bg-accent/30 p-5">
      <p className="text-sm text-muted-foreground">
        Columns: <code className="rounded bg-muted px-1 py-0.5 text-xs">{HEADERS.join(", ")}</code>. Set <code className="rounded bg-muted px-1 py-0.5 text-xs">category</code> to &ldquo;Steward&rdquo; to have someone appear on the Stewards Care page too.
      </p>
      <Button variant="outline" size="sm" onClick={downloadTemplate}><Download size={14} /> Download template</Button>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center hover:bg-muted/30">
        <Upload className="text-muted-foreground" size={22} />
        <span className="text-sm font-medium">{fileName || "Click to choose a CSV file"}</span>
        <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-success"><CheckCircle2 size={15} /> {valid.length} ready</span>
            {invalidCount > 0 && <span className="flex items-center gap-1.5 text-destructive"><AlertTriangle size={15} /> {invalidCount} skipped (missing name/phone)</span>}
          </div>
          <Button onClick={handleImport} disabled={importing || valid.length === 0}>
            {importing && <Loader2 className="animate-spin" />}
            {importing ? "Importing…" : `Import ${valid.length} record${valid.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
