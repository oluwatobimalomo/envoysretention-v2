import { PublicFeedbackForm } from "@/features/feedback/components/public-feedback-form";
import { BrandMark } from "@/components/layout/brand-mark";

export const metadata = { title: "Feedback · The Envoys" };

export default function GiveFeedbackPage() {
  return (
    <div className="flex min-h-svh justify-center bg-gradient-to-b from-brand-green-light to-background px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <BrandMark size={64} />
          <h1 className="font-display text-xl font-semibold">We&apos;d love your feedback</h1>
          <p className="text-sm text-muted-foreground">Share your experience with us today. You may submit anonymously.</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <PublicFeedbackForm />
        </div>
      </div>
    </div>
  );
}
