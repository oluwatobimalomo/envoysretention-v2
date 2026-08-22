export const TESTIMONY_CATEGORIES = [
  "General Testimony",
  "Coronation Service Testimony",
  "Upgrade Service Testimony",
] as const;

export interface TestimonyEntry {
  id: string;
  display_name: string;
  category: string | null;
  testimony: string;
  date: string;
}
