"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavIcon } from "./nav-icon";
import type { NavSection } from "@/lib/config/roles";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function SidebarNav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeSectionTitle = sections.find((s) => s.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/")))?.title ?? null;
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(activeSectionTitle ? [activeSectionTitle] : []));
  const isGrouped = sections.length > 0 && sections[0].title !== null;

  const renderItem = (item: NavSection["items"][number]) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link key={item.id} href={item.href} onClick={onNavigate}
        className={cn("flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors", isGrouped && "pl-4",
          active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground")}
      >
        <NavIcon name={item.icon} size={16} className="shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  if (!isGrouped) return <nav className="flex flex-col gap-1 px-2">{sections[0]?.items.map(renderItem)}</nav>;

  return (
    <nav className="flex flex-col gap-1 px-2">
      {sections.map((section) => {
        const title = section.title!;
        const open = openSections.has(title);
        return (
          <Collapsible key={title} open={open}
            onOpenChange={(next) => setOpenSections((prev) => {
              const n = new Set(prev);
              if (next) { n.add(title); } else { n.delete(title); }
              return n;
            })}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold tracking-wide text-sidebar-foreground/55 hover:text-sidebar-foreground/85">
              {title}
              <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-1">{section.items.map(renderItem)}</CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}
