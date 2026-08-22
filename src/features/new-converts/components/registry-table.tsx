import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { ncGenderTag } from "../constants";
import type { NewConvertRow } from "../services/new-converts-service";

export function RegistryTable({ rows }: { rows: NewConvertRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <Users className="text-muted-foreground" size={28} />
        <p className="font-medium">No New Converts found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search or date range.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Conversion Date</th>
            <th className="px-4 py-3 font-medium">Training</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{r.full_name}{ncGenderTag(r.gender)}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
              <td className="px-4 py-3">
                <Badge variant={r.conversion_type === "New Salvation" ? "success" : "gold"}>{r.conversion_type}</Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.conversion_date}</td>
              <td className="px-4 py-3">
                {r.envoys_training_completed ? <Badge variant="success">Complete</Badge> : <Badge variant="outline">Pending</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
