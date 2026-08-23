import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
export function NotificationBell() {
  return (
    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" disabled title="Notifications — coming soon">
      <Bell size={18} />
    </Button>
  );
}
