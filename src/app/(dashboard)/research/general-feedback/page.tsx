import { requireRole } from "@/features/auth/utils/require-role";
import { feedbackService } from "@/features/feedback/services/feedback-service";
import { FeedbackToolbar } from "@/features/feedback/components/feedback-toolbar";
import { FeedbackList } from "@/features/feedback/components/feedback-list";

export const metadata = { title: "General Feedback" };

export default async function GeneralFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  await requireRole(["admin", "experienceadmin", "research"]);
  const sp = await searchParams;
  const entries = await feedbackService.listGeneral({ search: sp.q, dateFrom: sp.from, dateTo: sp.to });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">General Feedback</h1>
        <p className="text-sm text-muted-foreground">{entries.length} response{entries.length !== 1 ? "s" : ""} submitted through the public Feedback QR only.</p>
      </div>
      <FeedbackToolbar />
      <FeedbackList entries={entries} filename={`general-feedback-${new Date().toISOString().slice(0, 10)}.csv`} />
    </div>
  );
}
