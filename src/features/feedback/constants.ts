export const FEEDBACK_FOCUS_POINTS = [
  "Spiritual Growth & Discipleship",
  "Message/Teaching",
  "Worship Experience",
  "Community & Belonging",
  "Leadership & Stewardship",
  "Volunteer/Service Opportunities",
  "Events & Special Programs",
  "Service Flow & Timing",
  "Church Environment",
  "Digital Engagement",
] as const;

export interface FeedbackEntry {
  id: string;
  display_name: string;
  gender: string | null;
  phone: string | null;
  feedback: string;
  date: string;
  source: "First-Timer Form" | "Feedback Form";
}
