export const MEGASTAR_CLASSES = ["Nursery", "Toddlers", "Pre-K", "Grade 1-2", "Grade 3-5", "Teens"] as const;

export function megastarAge(dob: string | null): number | null {
  if (!dob) return null;
  const [y, m, d] = dob.slice(0, 10).split("-").map(Number);
  if (!y) return null;
  const t = new Date();
  let a = t.getFullYear() - y;
  if (t.getMonth() + 1 < m || (t.getMonth() + 1 === m && t.getDate() < d)) a--;
  return a;
}

const PROMOTE_THRESHOLDS: Record<string, number> = {
  Nursery: 3, Toddlers: 5, "Pre-K": 7, "Grade 1-2": 10, "Grade 3-5": 13,
};

export function suggestPromotion(dob: string | null, currentClass: string | null): boolean {
  const age = megastarAge(dob);
  if (age === null || !currentClass) return false;
  const threshold = PROMOTE_THRESHOLDS[currentClass];
  return threshold !== undefined && age >= threshold;
}
