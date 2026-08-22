"use client";

import { useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { newContactSchema, type NewContactInput } from "../schemas/visit-schema";
import { bulkImportContactsAction } from "../actions/soul-care-actions";

const TEMPLATE_HEADERS = ["full_name", "phone", "email", "gender", "marital_status", "life_stage", "dob", "house_address", "nearest_landmark"];
const TEMPLATE_EXAMPLE = ["Adaeze Okafor", "08031234567", "adaeze@example.com", "Female", "Married", "Employee", "1994-03-12", "12 Palm Street Ikeja", "Near Chevron Roundabout"];

type ParsedRow = Record<string, string>;

export function SoulCareCsvImport() {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");

  const downloadTemplate = () => {
    const csv = [TEMPLATE_HEADERS.join(","), TEMPLATE_EXAMPLE.join(",")].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "soul-care-contacts-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setErrors([]);
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => setRows(results.data),
      error: (err) => setErrors([err.message]),
    });
  };

  const validated: { input: NewContactInput; row: number; error?: string }[] = rows.map((r, i) => {
    const candidate = {
      full_name: r.full_name ?? "",
      phone: r.phone ?? "",
      email: r.email ?? "",
      gender: (r.gender as NewContactInput["gender"]) ?? "",
      marital_status: (r.marital_status as NewContactInput["marital_status"]) ?? "",
      life_stage: (r.life_stage as NewContactInput["life_stage"]) ?? "",
      dob: r.dob ?? "",
      house_address: r.house_address ?? "",
      nearest_landmark: r.nearest_landmark ?? "",
    };
    const parsed = newContactSchema.safeParse(candidate);
    return parsed.success
      ? { input: parsed.data, row: i + 2 }
      : { input: candidate as NewContactInput, row: i + 2, error: parsed.error.issues[0]?.message };
  });

  const validRows = validated.filter((v) => !v.error);
  const invalidRows = validated.filter((v) => v.error);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const count = await bulkImportContactsAction(validRows.map((v) => v.input));
      toast.success(`Imported ${count} contact${count !== 1 ? "s" : ""}.`);
      router.push("/soul-care/queue");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <p className="mb-3 text-sm text-muted-foreground">
          Columns expected: <code className="rounded bg-muted px-1 py-0.5 text-xs">{TEMPLATE_HEADERS.join(", ")}</code>
        </p>
        <Button variant="outline" size="sm" onClick={downloadTemplate}><Download size={14} /> Download CSV template</Button>
      </div>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center hover:bg-muted/30">
        <Upload className="text-muted-foreground" size={24} />
        <span className="text-sm font-medium">{fileName || "Click to choose a CSV file"}</span>
        <span className="text-xs text-muted-foreground">or drag and drop</span>
        <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>

      {errors.length > 0 && <p className="text-sm text-destructive">{errors.join(", ")}</p>}

      {rows.length > 0 && (
        <div className="space-y-3 rounded-xl border p-5">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-success"><CheckCircle2 size={15} /> {validRows.length} ready to import</span>
            {invalidRows.length > 0 && (
              <span className="flex items-center gap-1.5 text-destructive"><AlertTriangle size={15} /> {invalidRows.length} row(s) with errors (skipped)</span>
            )}
          </div>
          {invalidRows.length > 0 && (
            <ul className="max-h-32 space-y-0.5 overflow-y-auto text-xs text-muted-foreground">
              {invalidRows.map((v) => <li key={v.row}>Row {v.row}: {v.error}</li>)}
            </ul>
          )}
          <Button onClick={handleImport} disabled={importing || validRows.length === 0}>
            {importing && <Loader2 className="animate-spin" />}
            {importing ? "Importing…" : `Import ${validRows.length} row${validRows.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
