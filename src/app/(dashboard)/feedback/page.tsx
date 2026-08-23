import { requireRole } from "@/features/auth/utils/require-role";
import { feedbackService } from "@/features/feedback/services/feedback-service";
import { CallNotesList } from "@/features/feedback/components/call-notes-list";

export const metadata = { title: "All Feedback" };

export default async function AllFeedbackPage() {
  await requireRole(["admin", "experienceadmin", "expteam"]);
  const rows = await feedbackService.listCallNotes();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">All Feedback</h1>
        <p className="text-sm text-muted-foreground">{rows.length} note{rows.length !== 1 ? "s" : ""} logged during Experience Team calls.</p>
      </div>
      <CallNotesList rows={rows} />
    </div>
  );
}
