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

## ✅ Module 9 — Research & Feedback — DONE
- [x] SQL `0011_feedback_submissions.sql`: `feedback_submissions` table + RLS (public insert, staff select) — `/feedback` and `/feedback/flagged` reuse the existing `call_feedback` table from Module 3, no new table needed there
- [x] `/give-feedback` — public, optionally-anonymous feedback form (name/gender/phone optional, membership status + focus points + feedback required)
- [x] `/research/feedback` ("VIPs Feedback") — merges First-Timer form feedback + public Feedback QR submissions, exactly like V1's `ResearchFeedback`
- [x] `/research/general-feedback` — public Feedback QR submissions only, same list UI
- [x] `/research/qr` — QR code linking to `/give-feedback`
- [x] `/feedback` ("All Feedback") — every call note logged during the Experience Team's 3-week pipeline
- [x] `/feedback/flagged` — pastoral escalations from call feedback, with 3+ day aging indicator
- [x] Row-selection + CSV export on both research feedback views (select-then-download, matching V1's UX)
- [x] This fixes the **Research** role's broken landing page — was one of the 4 roles landing on a bare "Coming Soon" screen, now lands on a real, working page
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 59 routes

## ✅ Module 10 — Testimonies — DONE
- [x] SQL `0012_public_testimonies.sql`: `public_testimonies` table + RLS — `/testimonies` itself reuses the existing `soul_care_visits.testimony` field from Module 5, no new table needed there
- [x] `/share-testimony` — public, optionally-anonymous testimony form (name optional, category, testimony)
- [x] `/testimonies` — testimonies shared during Soul Care visitations, search + date filter, select-then-export CSV
- [x] `/testimonies/bank` — public Testimony QR submissions, same list UX plus a category filter
- [x] `/testimonies/qr` — QR code linking to `/share-testimony`
- [x] This fixes the **Testimony Team** role's broken landing page — 2 of the original 4 "Coming Soon" roles now fixed (Research, Testimony Team); Connect Centre remains
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 60 routes
- Note: V1's full-screen "Testimony Projector" (pulpit reader with persisted navigation state, dynamic font sizing) not ported — flagged as a genuine V1 feature not yet in V2, not silently dropped

## ✅ Module 11 — Connect Centre — DONE
- [x] SQL `0013_connect_centre.sql`: `connect_centre_prospects` table + RLS, **auto-populated by a trigger** on `pipeline_overviews` — whenever a VIP Retention Overview recommends a Connect Center, a prospect row is created automatically from `first_timers` data. No manual entry.
- [x] `/connect-centre` — stat cards, filter by centre + confirmed/awaiting, search, select-then-export CSV, one-click "Mark Confirmed" with Undo
- [x] This fixes the **Connect Centre** role's landing page — **all 11 roles now land on a real, working page at login**, closing out the original 4-broken-landings issue entirely
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 60 routes

## ✅ Auth self-service upgrade — DONE
Three real gaps in the access-request flow, fixed:
- [x] SQL `0014_password_selfservice.sql`: `access_requests.user_id` column, `handle_new_user()` updated to respect a `pending` metadata flag
- [x] **Self-service password**: the requester now sets their own password on `/request-access`. The Supabase Auth account is created immediately (password stored securely by Supabase, never touched by our code) but `is_active=false` until an admin approves — approval just flips that flag, no more temp-password hand-off for this path. Denying a request now actually deletes the unused account instead of leaving an orphaned inactive login.
- [x] **Forgot Password**: `/forgot-password` (request reset email) → `/reset-password` (set new password, using Supabase's standard recovery-link flow) → redirect to `/login`. Added a "Forgot password?" link on the sign-in form.
- [x] **Admin password reset**: a "Reset Password" button per team member on `/admin/users`, generates a new temporary password via the admin API, shown once for secure hand-off — same pattern as the original direct-create flow.
- [x] Login's "inactive account" message now covers both pending-approval and deactivated cases without misleading wording
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 62 routes
- Note: password-reset emails require Supabase's email sending to be configured (default Supabase email service works out of the box in most cases, but check Supabase dashboard → Authentication → Email if reset emails don't arrive)

## ✅ Module 5b — Membership Records — DONE
- [x] SQL `0015_church_members.sql`: `church_members` table (Stewards + Members registry, distinct from the Soul Care visit pool) + RLS
- [x] `/soul-care/steward-care` — Stewards registry: stat cards (Total, Active, New This Month, Children), search + filters, click-to-toggle Active/Inactive status, "Add to Pool" (creates a `soul_care_contacts` row)
- [x] `/soul-care/members-care` — same registry UI for Members, plus a toggleable **CSV bulk import** (admin/soulcareadmin only)
- [x] `/soul-care/priority` — Care Priority List: everyone marked Inactive, sorted by days-since-last-contact (never contacted = highest priority), with stat cards
- [x] `/soul-care/vip-journey` — a real 5-stage funnel (Registered → Welcomed → Overview Submitted → Connect Centre Confirmed → Graduated Envoy), built entirely from data already collected across Modules 2, 3, 4, 6, and 11 — no new tracking needed
- [x] **"Last Visitation"/"Last Call"/"In Pool" are all derived**, not stored — matched at query time by normalized phone number against `soul_care_contacts`/`soul_care_visits`, exactly matching V1's approach (no data duplication between the membership registry and the active care pool)
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 62 routes
- [x] **Every Soul Care nav item is now a real page** — this was the last set of "Coming Soon" placeholders in the entire app tied to a specific, named module
- Note: V1's dedicated full-page "Member Profile" (visit history deep-dive per member) not ported — Add to Pool + inline status toggle cover the actionable core; flagged as a future nicety, not a silent drop

## ✅ Module 13 (core) — Reports & Dashboards — DONE
- [x] `/reports` — full retention analytics: stat cards (First-Timers, Calls Logged, Conversion Rate, Flagged), VIP Membership Decision donut, Call Outcomes bar chart, Weekly Call Activity trend line, **New Golden Envoys** scrollable table with CSV export, Returning Likelihood + Experience Rating bars, Gender Split donut, Caller Leaderboard, Areas of Interest breakdown — all real Recharts visualizations over live Supabase data, with a shared date-range filter across every chart (matches V1's Report component)
- [x] `/experience/dashboard` — a leaner Experience-Team-focused subset of the same underlying stats (VIP Decision Split, Call Outcomes, Weekly Trend, Caller Leaderboard, Returning Likelihood)
- [x] One shared `getReportStats()` aggregation service powers both pages — a single query pass over `first_timers`, `call_feedback`, and `pipeline_overviews`, not duplicated logic
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 62 routes
- Deferred, not silently dropped: V1's PDF export (via `@react-pdf/renderer`) and the threshold-based AI-style text summary generator on the Soul Care funnel report — both are real V1 features, genuinely lower-value than the charts themselves, left for a follow-up pass
- `/soul-care/dashboard` (built in Module 5b's design pass) still shows live counts without charts — could get the same Recharts treatment in a follow-up if wanted

## ✅ Fix: Experience Team (expteam) role access gap — DONE
Found by directly comparing V2 against V1's live production app — `expteam` had only 1 sidebar item ("My Calls") when V1 gives them 5: My Calls, Call Queue, All Feedback, Flagged, and Analytics Dashboard.
- [x] `roles.ts` — added the 4 missing nav items to `expteam`
- [x] Route permissions updated on `/feedback`, `/feedback/flagged`, `/experience/dashboard` to allow `expteam` (Call Queue already allowed them)
- [x] SQL `0016_expteam_feedback_access.sql` — **the deeper bug**: even with page access granted, the `call_feedback` RLS policy was still silently restricting `expteam` to only their own assigned contacts' records, which would have made "All Feedback" quietly show a much smaller list than intended, with no visible error. Fixed at the database level.
- [x] Restored missing UI/functionality on My Calls cards that V1 has: avatar initials, clickable `tel:` phone link, a WhatsApp quick-message icon, a Pending/In Progress/Complete status badge, a "Next: Week X" indicator next to the week pills, a "No call logs yet — start with Week 1" helper line (or last call summary once logged), and colored left-border accents on the stat cards
- [x] Verified: `tsc --noEmit`, `eslint --max-warnings=0`, `next build` all clean across all 62 routes
- **Worth flagging honestly**: this was caught because you happened to test as `expteam` and compare screenshots. The original nav config (`roles.ts`) was written once in the very first commit based on my reading of V1's source, not verified role-by-role against the live app since. It's plausible other roles have similar, still-undiscovered gaps between what V2 grants and what V1 actually gave them — a full side-by-side audit (log in as each of the 11 roles in both apps, compare sidebars) would be the thorough way to rule this out completely.

## Next task
Module 12 (remainder) — the rest of Admin. Most of it (access requests, approve/deny, direct user creation) already shipped when fixing the login page. After that: Module 5b (Membership Records) and Module 13 (Reports & Dashboards with real charts) are the two largest remaining gaps.
