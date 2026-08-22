# The Envoys — V2 Master Build Checklist

## ✅ Structural pass — DONE
- Auth, roles, RLS, sidebar/nav, dark mode, all 46 routes reachable (see prior notes)
- **Church logo wired in**: `public/logo.png` → `<BrandMark>` component used in Sidebar, MobileHeader, Login page, and the public Register page

## ✅ Module 2 — First-Timers registry — DONE
- [x] SQL migration `0002_first_timers.sql`: table, constraints, indexes, full-text search index on name, RLS (staff read/write by role, **public insert-only** policy for the QR self-registration form — same open-registration UX as V1, but now scoped and auditable instead of a bare anon key)
- [x] `/first-timers` — list with search (name/phone), date-range filter, pagination, empty state, loading via Suspense-free server fetch
- [x] `/first-timers/new` — add form (admin/dofficer only)
- [x] `/first-timers/[id]/edit` — edit form, same shared component as add
- [x] `/first-timers/qr` — downloadable/copyable QR code linking to `/register`
- [x] `/first-timers/import` — CSV import: template download, client-side parse + validate preview, bulk insert
- [x] `/register` — public, unauthenticated self-registration form (ported field-for-field from V1's `PublicForm`, including the "no membership_decision/heard_from shown" public-mode restriction)
- [x] Live phone-number duplicate check while typing (debounced), same UX as V1
- [x] CSV export button on the list (respects current search/date filters)
- [x] Gender tag "(M)/(F)" in the table, matching V1's display convention
- [x] Fixed a React Compiler lint violation along the way (setState called synchronously inside an effect) — all state updates in the dedupe-check effect now happen inside the debounce callback
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 54 routes

## ⏳ Modules (build order — next up first)
- [ ] **Module 3 — Call pipeline**: `/experience/assign-calls`, `/experience/my-calls`, `/experience/call-queue`, `/experience/completed`, log feedback, pipeline overview → membership recommendation
- [ ] **Module 4 — VIP Contact**: `/first-timers/vip-contact`, WhatsApp template, messaged status
- [ ] **Module 5 — Soul Care**: visits, assign, queue, flagged, priority list, members/stewards care, photo upload to Storage
- [ ] **Module 6 — Potential Envoys**
- [ ] **Module 7 — New Converts**: registry, assign, QR, retention report
- [ ] **Module 8 — Megastars**: check-in/out, services, roster
- [ ] **Module 9 — Research & Feedback**
- [ ] **Module 10 — Testimonies**
- [ ] **Module 11 — Connect Centre**
- [ ] **Module 12 — Admin**: users list, add user (needs a Supabase Edge Function using the service-role key), role management
- [ ] **Module 13 — Reports & Dashboards** (Recharts)
- [ ] **Module 14 — Notifications** (real `NotificationBell`)
- [ ] **Module 15 — Birthday wishes**
- [ ] **Module 16 — `/profile` page**
- [ ] **Module 17 — Cross-cutting**: PWA/service worker parity, Storybook, Vitest, Playwright, CI

## Next task
Module 3 — Call pipeline (Assign Calls, My Calls, Log Feedback 3-week, Pipeline Overview, Completed Pipelines, Call Queue). This is V1's largest single module — depends on `first_timers` (done) plus new tables: `call_assignments`, `call_feedback`, `pipeline_overviews`.
