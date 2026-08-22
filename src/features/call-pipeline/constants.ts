export const CALL_STATUS_OPTIONS = [
  { value: "Reached", label: "Reached: spoke with the VIP" },
  { value: "Not Reached", label: "Not Reached: did not answer" },
  { value: "Callback Requested", label: "Callback Requested by VIP" },
  { value: "Wrong Number", label: "Wrong Number/Invalid" },
] as const;

export const EXPERIENCE_RATING_OPTIONS = ["Excellent", "Good", "Average", "Poor"] as const;
export const RETURNING_OPTIONS = [
  { value: "Yes", label: "Yes: will return next week" },
  { value: "Maybe", label: "Maybe: on special services" },
  { value: "No", label: "No: came to visit" },
  { value: "Undecided", label: "Undecided" },
] as const;
export const CHURCH_ATTENDANCE_OPTIONS = ["Present", "Absent", "Unknown"] as const;

export const CONNECT_CENTERS = [
  "Agege", "Aboru/Iyana Ipaja", "Akute", "Ayobo", "Berger",
  "Command/Ikeja", "Egbeda", "Iju-Ishaga", "Magboro", "Mile 12",
  "Ogba", "Ojoo", "OPIC Estates", "Redemption City",
] as const;

export const NATURAL_GROUPS = ["Interphaze", "Solid Rock", "Royal Diadem"] as const;

/** Raw call_status -> normalized bucket used for filtering/coloring. */
export function normaliseStatus(raw: string | null | undefined): "Reached" | "Incorrect Contact" | "Call Back" | null {
  if (!raw) return null;
  if (raw === "Reached") return "Reached";
  if (raw === "Wrong Number") return "Incorrect Contact";
  return "Call Back";
}

export interface WeekRow {
  week_number: number;
  call_status: string;
}

export function weeksLogged(fbRows: WeekRow[]): Set<number> {
  const weeks = new Set<number>();
  for (const r of fbRows ?? []) if (r.week_number) weeks.add(r.week_number);
  return weeks;
}

export function nextWeek(fbRows: WeekRow[]): number | null {
  const done = weeksLogged(fbRows);
  for (let w = 1; w <= 3; w++) if (!done.has(w)) return w;
  return null;
}

export function pipelineComplete(fbRows: WeekRow[]): boolean {
  return nextWeek(fbRows) === null;
}

export function genderTag(gender: string | null | undefined): string {
  if (gender === "Male") return " (M)";
  if (gender === "Female") return " (F)";
  return "";
}
