"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { NotificationBell } from "./notification-bell";
import { TopUserMenu } from "./top-user-menu";
import { BrandMark } from "./brand-mark";
import { buildNavSections, type AppRole } from "@/lib/config/roles";

/** Persistent header bar, visible at every screen size — unlike the old
 *  MobileHeader (which only rendered below the `md` breakpoint), so the
 *  notification bell and profile menu are never invisible on desktop. */
export function TopBar({ role, fullName }: { role: AppRole; fullName: string }) {
  const [open, setOpen] = useState(false);
  const sections = buildNavSections(role);

  return (
    <header className="flex items-center justify-between gap-2 border-b bg-card px-4 py-2.5">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu size={20} /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="flex-row items-center gap-2.5 space-y-0 border-b border-sidebar-border">
              <BrandMark size={24} />
              <SheetTitle>The Envoys</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-2">
              <SidebarNav sections={sections} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-display font-semibold">
          <BrandMark size={22} /> The Envoys
        </Link>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <TopUserMenu fullName={fullName} role={role} />
      </div>
    </header>
  );
}
