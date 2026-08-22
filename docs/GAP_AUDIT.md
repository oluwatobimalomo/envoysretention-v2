# Gap Audit — Modules 2–6 (as of commit f8c0dea)

You were right to ask for this. Modules 2–6 are **real and functional** — they compile, they read/write to Supabase, the core workflows work — but I under-scoped several things V1 actually has, and I called modules "done" when they were closer to "80% done." Below is every confirmed gap, checked directly against the code, not from memory.

## Cross-cutting gaps (same issue repeated in 4 different modules)

**1. No reassignment/unassignment, anywhere.**
Once a row shows an assignee, the UI only renders a read-only badge — there's no way to change who it's assigned to, or unassign it, without going into Supabase directly. Confirmed in:
- `assign-calls-client.tsx` (Call Pipeline)
- `assign-visits-client.tsx` (Soul Care)
- `assign-pe-client.tsx` (Potential Envoys)
- `vip-contact-client.tsx` (VIP Contact)

V1 supported reassignment in at least Potential Envoys (`removeAssignment`). This is a real, practical gap — admins will hit this immediately.

**2. No CSV export outside First-Timers.**
Only `first-timers-toolbar.tsx` has an export button. V1 has CSV export/download on most admin-facing list views (Completed Pipelines, VIP Contact, Soul Care queue, Potential Envoys). Nothing else does.

**3. No "edit an already-logged week" in either pipeline.**
`LogFeedbackDialog` (Call Pipeline) and `PeLogFeedbackDialog` (Potential Envoys) only ever open for the *next incomplete* week. If someone logs Week 2 with a typo, there's no way to go back and fix it — V1 explicitly supported this (`onEditWeekFeedback`).

## Module-specific gaps

**Soul Care — the biggest shortfall:**
- `/soul-care/queue` has **no search and no date filter** — it's a bare unfiltered list. Every other list page in the app has at least a search box; this one doesn't.
- `/soul-care/my-visits` only shows the **most recent visit**, not full visit history per contact. V1 shows the complete visit log per person.
- **No way to edit a previously logged visit** — `LogVisitDialog` only creates new visits, never edits (V1's `LogVisitForm` supports `editVisit`).
- No bulk CSV import for the contact pool (V1's `AssignVisitsView` had one, similar to First-Timers import).

**Call Pipeline:**
- No CSV export on Completed Pipelines (checkbox-select + download existed in V1).
- Call Queue has search but no date-range filter (V1 had both).

**Potential Envoys:**
- Assign view has filter tabs but no date filter.
- No CSV export.

**VIP Contact:**
- This one's actually close to complete — V1's version also has no bulk-assign and no CSV export, so nothing extra missing here beyond the reassignment gap above.

## What's NOT a gap — deferred on purpose, already documented
These were flagged honestly in the checklist as out of scope, not silently dropped:
- Soul Care: Members Care, Stewards Care, Priority List, VIP Journey Dashboard (need `church_members` table — Module 5b)
- All analytics/chart dashboards (`/reports`, `/experience/dashboard`, `/soul-care/dashboard`) — Module 13
- `/experience/visitors` (Envoys Visitors archive) — not previously scoped at all, adding to backlog below

## Recommended fix order
Given how much these overlap, fixing them together is more efficient than one module at a time:

1. **Reassignment control** — one shared pattern, applies to all 4 assign views at once
2. **Soul Care queue search/filter** — quick, matches existing First-Timers pattern
3. **Edit-visit capability** — reuses `LogVisitDialog`, just needs an `editVisit` prop like V1
4. **Edit-existing-week capability** — reuses `LogFeedbackDialog`/`PeLogFeedbackDialog` similarly
5. **CSV export** — one reusable export action, wired into 4 list pages
6. Soul Care full visit history on `/soul-care/my-visits`
7. Soul Care CSV import

Items 1–4 are all "add one prop / one action" fixes to existing components, not new modules — they're the highest-value, lowest-effort fixes.
