/**
 * Deterministic date/time formatting — used anywhere a date renders in a
 * component that gets server-rendered then hydrated on the client.
 *
 * `.toLocaleString()`/`.toLocaleDateString()` format using the RUNTIME's
 * default locale, which differs between the server (often en-US/UTC) and
 * a user's actual browser (their real locale/timezone) — causing a
 * hydration mismatch, since the server-rendered text and the
 * client-rendered text are literally different strings.
 *
 * Simply avoiding `.toLocaleString()` isn't enough on its own either:
 * Postgres timestamps are stored in UTC, and even manual formatting via
 * `Date.getHours()` etc. still depends on whichever timezone the runtime
 * (server vs. browser) happens to be in. The actual fix is pinning BOTH
 * the locale and the timezone explicitly, so server and client always
 * compute the same output no matter their own local settings.
 */
const TIME_ZONE = "Africa/Lagos";
const LOCALE = "en-GB";

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE, day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  }).format(new Date(iso));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE, day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(iso));
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: true,
  }).format(new Date(iso));
}
