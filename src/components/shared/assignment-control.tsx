"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { X, UserCog } from "lucide-react";

/**
 * Shared assign/reassign/unassign control used across every "Assign X"
 * screen (Call Pipeline, Soul Care, Potential Envoys, VIP Contact).
 * Previously each screen only showed a read-only badge once assigned,
 * with no way to change or remove the assignment from the UI.
 */
export function AssignmentControl({
  currentAssigneeName,
  teamMembers,
  onAssign,
  onUnassign,
  pending,
}: {
  currentAssigneeName: string | null;
  teamMembers: { id: string; full_name: string }[];
  onAssign: (memberId: string) => void;
  onUnassign?: () => void;
  pending?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState("");

  if (currentAssigneeName && !editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="secondary">Assigned to {currentAssigneeName}</Badge>
        <Button variant="ghost" size="icon" className="size-7" onClick={() => setEditing(true)} title="Reassign">
          <UserCog size={13} />
        </Button>
        {onUnassign && (
          <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={onUnassign} disabled={pending} title="Unassign">
            <X size={13} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <NativeSelect className="w-40" value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">{currentAssigneeName ? "Reassign to…" : "Assign to…"}</option>
        {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
      </NativeSelect>
      <Button
        size="sm"
        variant="outline"
        disabled={!selected || pending}
        onClick={() => { onAssign(selected); setSelected(""); setEditing(false); }}
      >
        Save
      </Button>
      {currentAssigneeName && (
        <Button variant="ghost" size="icon" className="size-7" onClick={() => setEditing(false)}>
          <X size={13} />
        </Button>
      )}
    </div>
  );
}
