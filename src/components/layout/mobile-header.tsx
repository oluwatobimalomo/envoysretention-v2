"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { BrandMark } from "./brand-mark";
import { buildNavSections, type AppRole } from "@/lib/config/roles";

export function MobileHeader({ role, fullName }: { role: AppRole; fullName: string }) {
  const [open, setOpen] = useState(false);
  const sections = buildNavSections(role);
  return (
    <header className="flex items-center gap-2 border-b border-sidebar-border bg-sidebar px-3 py-2.5 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-sidebar-foreground"><Menu size={20} /></Button></SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="flex-row items-center gap-2.5 space-y-0 border-b border-sidebar-border">
            <BrandMark size={24} />
            <SheetTitle>The Envoys</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-2"><SidebarNav sections={sections} onNavigate={() => setOpen(false)} /></div>
          <div className="border-t border-sidebar-border p-2"><UserMenu fullName={fullName} role={role} /></div>
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex flex-1 items-center gap-2 truncate font-semibold text-sidebar-foreground">
        <BrandMark size={22} /> The Envoys
      </Link>
      <NotificationBell />
    </header>
  );
}
