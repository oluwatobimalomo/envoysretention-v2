export const SC_VISIT_TYPES = [
  "Home (Periodic)",
  "Celebration",
  "Pastoral Care",
  "Welfare Check",
  "Phone Call",
] as const;

export const VISIT_STATUS_OPTIONS = ["Scheduled", "Completed", "Rescheduled", "Member Unavailable"] as const;
export const URGENCY_OPTIONS = ["High", "Medium", "Low"] as const;

export function scGenderTag(gender: string | null | undefined): string {
  if (gender === "Male") return " (M)";
  if (gender === "Female") return " (F)";
  return "";
}
