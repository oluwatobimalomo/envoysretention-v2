import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
export function NotificationBell() {
  return (
    <Button variant="ghost" size="icon" className="text-sidebar-foreground/80 hover:text-sidebar-foreground" disabled>
      <Bell size={18} />
    </Button>
  );
}
