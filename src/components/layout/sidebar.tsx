import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { BrandMark } from "./brand-mark";
import { buildNavSections, type AppRole } from "@/lib/config/roles";

export function Sidebar({ role }: { role: AppRole }) {
  const sections = buildNavSections(role);
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-4 py-4">
        <BrandMark size={32} />
        <span className="font-display font-semibold text-sidebar-foreground">The Envoys</span>
      </Link>
      <div className="flex-1 overflow-y-auto py-2"><SidebarNav sections={sections} /></div>
    </aside>
  );
}
