import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { normaliseStatus, weeksLogged, pipelineComplete, type WeekRow } from "../constants";

export function PipelineBar({ fbRows, compact = false }: { fbRows: WeekRow[]; compact?: boolean }) {
  const done = weeksLogged(fbRows);
  const complete = pipelineComplete(fbRows);

  const weekColor = (w: number) => {
    if (!done.has(w)) return "bg-muted text-muted-foreground";
    const row = fbRows.find((r) => r.week_number === w);
    const norm = normaliseStatus(row?.call_status);
    if (norm === "Reached") return "bg-success text-white";
    if (norm === "Call Back") return "bg-warning text-white";
    if (norm === "Incorrect Contact") return "bg-destructive text-white";
    return "bg-brand-green-mid text-white";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((w) => (
          <div key={w} className={cn("flex size-5 items-center justify-center rounded text-[9px] font-bold", weekColor(w))}>
            W{w}
          </div>
        ))}
        {complete && <CheckCircle2 size={12} className="ml-0.5 text-success" />}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {[1, 2, 3].map((w) => (
        <span key={w} className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", weekColor(w))}>
          Week {w}
        </span>
      ))}
      {complete ? (
        <span className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-success">
          <CheckCircle2 size={12} /> Pipeline complete
        </span>
      ) : (
        <span className="ml-1 text-xs text-muted-foreground">Next: Week {[1, 2, 3].find((w) => !done.has(w))}</span>
      )}
    </div>
  );
}
