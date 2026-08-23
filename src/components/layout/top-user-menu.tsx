"use client";

import { ChevronDown, LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/features/auth/actions/login-action";
import { ROLE_META, type AppRole } from "@/lib/config/roles";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/** Profile dropdown for the persistent top bar — light-themed, unlike
 *  the sidebar's dark-bg UserMenu. Lives in the top-right on every
 *  screen size, matching the conventional pattern (avatar + name +
 *  chevron, top-right corner) instead of being buried at the bottom of
 *  the sidebar where it was easy to miss and invisible on desktop
 *  alongside the notification bell. */
export function TopUserMenu({ fullName, role }: { fullName: string; role: AppRole }) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent">
        <Avatar className="size-7">
          <AvatarFallback className="text-[11px]">{initials(fullName)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{fullName}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">{fullName}</p>
          <p className="text-xs font-normal text-muted-foreground">{ROLE_META[role].label}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun /> : <Moon />} Toggle theme
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/profile"><User /> My profile</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => logoutAction()}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
