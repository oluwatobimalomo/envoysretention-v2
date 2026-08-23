import { requireRole } from "@/features/auth/utils/require-role";
import { feedbackService } from "@/features/feedback/services/feedback-service";
import { FeedbackToolbar } from "@/features/feedback/components/feedback-toolbar";
import { FeedbackList } from "@/features/feedback/components/feedback-list";

export const metadata = { title: "VIPs Feedback" };

export default async function ResearchFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  await requireRole(["admin", "experienceadmin", "research"]);
  const sp = await searchParams;
  const entries = await feedbackService.listMerged({ search: sp.q, dateFrom: sp.from, dateTo: sp.to });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Service Feedback</h1>
        <p className="text-sm text-muted-foreground">{entries.length} response{entries.length !== 1 ? "s" : ""} — from First-Timer forms and the public Feedback QR combined.</p>
      </div>
      <FeedbackToolbar />
      <FeedbackList entries={entries} filename={`service-feedback-${new Date().toISOString().slice(0, 10)}.csv`} />
    </div>
  );
}
