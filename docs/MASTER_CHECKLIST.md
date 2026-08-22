# The Envoys — V2 Master Build Checklist

## ✅ Structural pass, Module 2 (First-Timers) — DONE (see prior notes)

## ✅ Module 3 — Call Pipeline — DONE
- [x] SQL `0003_call_pipeline.sql`: `call_assignments`, `call_feedback`, `pipeline_overviews` + RLS (expteam only sees their own assignments; admin/experienceadmin see all)
- [x] DB trigger: submitting an overview with `move_to_membership = true` auto-syncs `first_timers.membership_decision = 'Member'` (matches V1)
- [x] `/experience/assign-calls` — bulk assign (select rows or "all unassigned") + individual assign, filter tabs, search
- [x] `/experience/my-calls` — stat cards, "due today/overdue" panel, filter tabs, Log Feedback dialog (Week 1→2→3), auto-prompts VIP Retention Overview dialog after Week 3 if not yet submitted
- [x] `/experience/call-queue` — status-categorized queue (pending/reached/callback/incorrect/complete)
- [x] `/experience/completed` — table of submitted VIP Retention Overviews with decision badges
- [x] Exact V1 field parity: `CALL_STATUS_OPTIONS`, experience rating, returning-likelihood, church attendance (week 2+), pastoral flagging, natural groups, connect centers

## ✅ Module 4 — VIP Contact — DONE
- [x] SQL `0004_vip_contact.sql`: `vip_message_assignments` + RLS
- [x] `/first-timers/vip-contact` — assign, WhatsApp deep-link (exact V1 welcome message template), Messaged/Not Messaged toggle, filter tabs, stat cards

## ✅ Module 5 — Soul Care (visits track) — DONE
- [x] SQL `0005_soul_care.sql`: `soul_care_contacts` (separate ongoing-care pool, distinct from `first_timers`), `soul_care_assignments`, `soul_care_visits` + RLS
- [x] SQL `0006_visit_photos_storage.sql`: Supabase Storage bucket `visit-photos`, public read, Soul Care-role-only write
- [x] `/soul-care/assign` — assign contacts to Soul Care team members
- [x] `/soul-care/my-visits` — assigned contacts, last-visit summary, Log Visit dialog
- [x] `/soul-care/queue` — full contact pool with assignment status
- [x] `/soul-care/visits/new` — search existing contact or add new one, then log the visit (mirrors V1's two-step flow)
- [x] `/soul-care/flagged` — pastoral escalations, 3+ day aging indicator
- [x] Visit form: type, urgency, status, notes, **photo upload** (direct-to-Storage from the browser), material support, prayer requests, testimony, follow-up, pastoral escalation
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 54 routes

## ⚠️ Discovered but deferred — not silently dropped
While reading V1 for Module 5, found it also has: `church_members` (a broader membership-records table), `StewardsCare`, `MembersCare`, `VipJourneyDashboard` (8-week funnel: registration → 48h contact → overview → Connect Centre confirmation → Potential Envoys graduation), and `connect_centre_prospects`. These read from a membership-records system V1 has that V2 doesn't have yet. Routes `/soul-care/members-care`, `/soul-care/steward-care`, `/soul-care/priority`, `/soul-care/vip-journey`, `/soul-care/dashboard` remain placeholders — flagged here as **Module 5b: Membership Records**, not forgotten.

Also simplified vs. V1 (noted, not hidden):
- No analytics/chart dashboards yet for `/experience/dashboard`, `/reports` — Recharts-based reporting is its own module (13)
- Experience/Soul Care "leaderboard" and weekly-trend widgets from V1's `Report`/`ExperienceAnalyticsDashboard` not yet ported

## ✅ Module 6 — Potential Envoys — DONE
- [x] SQL `0007_potential_envoys.sql`: `potential_envoys`, `potential_envoys_assignments`, `potential_envoys_feedback` (5-week pipeline) + RLS
- [x] `/soul-care/potential-envoys` — assign (bulk + individual), filter tabs (unassigned/assigned/active/graduated), stat cards
- [x] `/soul-care/my-potential-envoys` — 5-week progress indicator, Log Feedback dialog, training-completion checkbox, "Promote to Membership" button (unlocked once 5 weeks + training are both complete, matching V1)

## Remaining modules (build order)
- Module 5b — Membership Records: `church_members` table, Stewards Care, Members Care, Care Priority List, VIP Journey Dashboard
- Module 7 — New Converts: registry, assign, QR, retention report
- Module 8 — Megastars: check-in/out, services, roster
- Module 9 — Research & Feedback
- Module 10 — Testimonies
- Module 11 — Connect Centre
- Module 12 — Admin: users list, add user (Supabase admin API via Edge Function), role management
- Module 13 — Reports & Dashboards (Recharts): Report, Experience Dashboard, Soul Care Dashboard, VIP Journey Dashboard
- Module 14 — Notifications
- Module 15 — Birthday wishes
- Module 16 — /profile page
- Module 17 — Cross-cutting: PWA/service worker parity, Storybook, Vitest, Playwright, CI

## ✅ Gap fixes (from GAP_AUDIT.md) — DONE
All 7 confirmed gaps fixed and verified:
- [x] Reassignment/unassignment across all 4 assign screens (Call Pipeline, Soul Care, Potential Envoys, VIP Contact) via shared `AssignmentControl` component
- [x] CSV export added to Completed Pipelines, VIP Contact, Soul Care (assign + queue), Potential Envoys
- [x] Edit an already-logged week — click any completed week badge in My Calls / My Potential Envoys to reopen it pre-filled
- [x] Soul Care queue now has search + date-range filter (previously bare)
- [x] Soul Care `/soul-care/my-visits` shows full visit history per contact (previously only the most recent)
- [x] Soul Care visits are now editable (`LogVisitDialog` supports `editVisit`)
- [x] Soul Care CSV bulk import (`/soul-care/import`), mirroring the First-Timers import pattern
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 55 routes

## ✅ Module 7 — New Converts — DONE
- [x] SQL `0008_new_converts.sql`: `new_converts`, `new_converts_assignments`, `new_converts_checkins` (3-month track) + RLS, including a public insert-only policy for self-registration
- [x] `/new-converts` — registry with search, date filter, CSV export, gender-tagged rows, conversion-type badges
- [x] `/new-converts/new` — add form (admin/dofficer/soulcareadmin), live duplicate-phone check
- [x] `/new-converts/assign` — assign/reassign/unassign (bulk + individual), CSV export
- [x] `/new-converts/mine` — assigned list, clickable month badges for logging/editing check-ins, training-completion checkbox
- [x] `/new-converts/qr` — QR code linking to the public form
- [x] `/new-converts/report` — retention snapshot (counts + rates; full chart-based analytics deferred to Module 13, noted on the page itself)
- [x] `/register-convert` — public, unauthenticated self-registration (added to middleware's public routes)
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 57 routes

## ✅ Module 8 — Megastars — DONE
- [x] SQL `0009_megastars.sql`: `megastars` (children), `megastar_guardians`, `megastar_guardian_links` (many-to-many — a child can have multiple guardians, a guardian multiple children), `megastar_services`, `megastar_checkins` + RLS
- [x] `/megastars/services` — open/close services (check-in only works while a service is Open, matching V1)
- [x] `/megastars/check-in-out` — front-desk flow: live family search by guardian phone/name or child's name, multi-select check-in, check-out list with search, CSV attendance export
- [x] `/megastars/roster` — searchable/filterable-by-class roster, age calculated from DOB, "consider promoting class" hint, soft-remove with reason + restore, Add Megastar dialog (existing-guardian lookup or new-guardian registration)
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 57 routes
- Note: V1's roster CSV bulk import (guardian+child+link in one row) not yet ported — flagged for a follow-up pass, not silently dropped

## ✅ Login redesign + Module 12 (partial) — Access Requests & User Management — DONE
Prompted by a direct comparison against V1's actual login screen, which surfaced a real gap: V1 has a self-service "Request Access → admin approves" flow that V2 was completely missing — meaning there was no way to create staff logins in V2 at all except by hand in the Supabase dashboard.
- [x] SQL `0010_access_requests.sql`: `access_requests` table + RLS (public insert, admin-only read/review)
- [x] `src/lib/supabase/admin.ts`: service-role client, used only for the one operation that genuinely needs it — creating real Supabase Auth users
- [x] `/request-access` — public form (name, email, phone, requested team, optional message)
- [x] `/admin/users` — real page (was a placeholder): pending-requests queue with Approve/Deny, full team member list with role change + activate/deactivate
- [x] `/admin/users/new` — real page (was a placeholder): direct admin-created account, no approval step
- [x] Approving a request or creating a user directly generates a temporary password and creates the real Supabase Auth login on the spot (via `admin.auth.admin.createUser` + the existing `handle_new_user` trigger, which auto-populates `profiles`) — shown once to the admin to hand off securely
- [x] Login page redesigned: split-screen, editorial quote treatment (not literal V1 copy, not floating fake-stat cards) + the "New team member? Request access" link restored
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 58 routes
- Note: `/register` and `/register-convert` (the public First-Timer/New-Convert forms) still use the earlier centered-card style, not yet brought in line with the new login treatment

## Next task
Module 9 — Research & Feedback (`/research/feedback`, `/research/general-feedback`, `/research/qr`, `/feedback`, `/feedback/flagged`) — also fixes the Research role's landing page, which currently still lands on a placeholder.
