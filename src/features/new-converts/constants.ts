export const CONVERSION_TYPES = ["New Salvation", "Rededication"] as const;

export function ncNextCheckin(rows: { checkin_number: number }[]): number | null {
  const done = new Set(rows.map((r) => r.checkin_number));
  for (let m = 1; m <= 3; m++) if (!done.has(m)) return m;
  return null;
}

export function ncComplete(rows: { checkin_number: number }[]): boolean {
  return ncNextCheckin(rows) === null;
}

export function ncGenderTag(gender: string | null | undefined): string {
  if (gender === "Male") return " (M)";
  if (gender === "Female") return " (F)";
  return "";
}
