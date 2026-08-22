export function peNextWeek(fbRows: { week_number: number }[]): number | null {
  const done = new Set(fbRows.map((r) => r.week_number));
  for (let w = 1; w <= 5; w++) if (!done.has(w)) return w;
  return null;
}

export function peComplete(fbRows: { week_number: number }[]): boolean {
  return peNextWeek(fbRows) === null;
}
