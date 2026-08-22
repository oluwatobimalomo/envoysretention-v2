import Link from "next/link";
import { Edit3, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FirstTimerRow } from "../services/first-timers-service";

function genderTag(gender: string | null) {
  if (gender === "Male") return " (M)";
  if (gender === "Female") return " (F)";
  return "";
}

export function FirstTimersTable({ rows, canManage }: { rows: FirstTimerRow[]; canManage: boolean }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <Users className="text-muted-foreground" size={28} />
        <p className="font-medium">No first-timers found</p>
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
            <th className="px-4 py-3 font-medium">Service Date</th>
            <th className="px-4 py-3 font-medium">Life Stage</th>
            <th className="px-4 py-3 font-medium">Decision</th>
            {canManage && <th className="px-4 py-3 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{r.full_name}{genderTag(r.gender)}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.service_date}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.life_stage ?? "—"}</td>
              <td className="px-4 py-3">
                {r.membership_decision ? (
                  <Badge variant={r.membership_decision === "Member" ? "success" : "outline"}>{r.membership_decision}</Badge>
                ) : "—"}
              </td>
              {canManage && (
                <td className="px-4 py-3 text-right">
                  <Link href={`/first-timers/${r.id}/edit`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Edit3 size={13} /> Edit
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
