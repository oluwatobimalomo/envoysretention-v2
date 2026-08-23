/** Normalizes a phone number to its last 10 digits for cross-table
 *  matching (church_members <-> soul_care_contacts) — matches V1's
 *  phoneKey() exactly, since people often enter numbers with/without
 *  country code or formatting. */
export function phoneKey(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "").slice(-10);
}

export function cmAge(dob: string | null): number | null {
  if (!dob) return null;
  const [y, m, d] = dob.slice(0, 10).split("-").map(Number);
  if (!y) return null;
  const t = new Date();
  let a = t.getFullYear() - y;
  if (t.getMonth() + 1 < m || (t.getMonth() + 1 === m && t.getDate() < d)) a--;
  return a;
}

export function cmGenderTag(g: string | null) {
  if (g === "Male") return " (M)";
  if (g === "Female") return " (F)";
  return "";
}

export const MC_STATUS_META: Record<string, "success" | "destructive" | "warning"> = {
  Active: "success",
  Inactive: "destructive",
  Travelled: "warning",
};
