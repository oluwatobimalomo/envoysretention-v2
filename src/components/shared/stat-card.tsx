import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ComponentType<{ size?: number }>;
  tone?: "default" | "success" | "warning" | "destructive" | "gold";
  href?: string;
  sub?: string;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, { icon: string; border: string }> = {
  default: { icon: "bg-accent text-accent-foreground", border: "border-l-transparent" },
  success: { icon: "bg-success/15 text-success", border: "border-l-success" },
  warning: { icon: "bg-warning/15 text-warning", border: "border-l-warning" },
  destructive: { icon: "bg-destructive/15 text-destructive", border: "border-l-destructive" },
  gold: { icon: "bg-brand-gold-light text-brand-gold-foreground", border: "border-l-brand-gold" },
};

/**
 * Shared stat card, used everywhere a page shows a row of "N of
 * something" summary numbers — previously every module (Assign Calls,
 * Assign New Converts, Potential Envoys, Connect Centre, VIP Contact,
 * Envoys Visitors, Care Priority, Admin/Soul Care dashboards, ...) had
 * its own slightly-different hand-rolled version.
 */
export function StatCard({ label, value, icon: Icon, tone = "default", href, sub }: StatCardProps) {
  const t = TONE_CLASSES[tone];
  const content = (
    <>
      <div className="mb-2.5 flex items-center justify-between">
        <div className={cn("flex size-9 items-center justify-center rounded-full", t.icon)}>
          <Icon size={16} />
        </div>
        {href && <ArrowUpRight size={14} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />}
      </div>
      <p className="font-display text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </>
  );

  const className = cn("group rounded-xl border bg-card p-4 border-l-4 transition-colors", t.border, href && "hover:border-primary/40");

  if (href) {
    return <Link href={href} className={className}>{content}</Link>;
  }
  return <div className={className}>{content}</div>;
}
