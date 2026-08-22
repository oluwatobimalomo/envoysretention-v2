-- ============================================================================
-- 0005_soul_care.sql
-- Module 5: Soul Care — a separate ongoing-care contact pool (distinct
-- from first_timers, since Soul Care follows up with people over months/
-- years, not just the initial 3-week window), visit assignment, and
-- visit logging with pastoral escalation.
--
-- Ported from V1's soul_care_contacts / soul_care_assignments /
-- soul_care_visits. NOTE: V1 also has church_members / StewardsCare /
-- MembersCare / VipJourneyDashboard, which read from a broader
-- membership-records system not yet built in V2 — flagged in the
-- checklist as a follow-up module rather than silently dropped.
-- ============================================================================

create table public.soul_care_contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  gender text check (gender in ('Male', 'Female')),
  dob date,
  marital_status text check (marital_status in ('Single', 'Married', 'Divorced', 'Widowed')),
  life_stage text check (life_stage in ('Student', 'Employee', 'Business Owner')),
  house_address text,
  nearest_landmark text,
  original_first_timer_id uuid references public.first_timers (id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.soul_care_assignments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.soul_care_contacts (id) on delete cascade,
  assigned_to uuid not null references public.profiles (id),
  assigned_by uuid references public.profiles (id),
  assigned_at timestamptz not null default now(),
  unique (contact_id)
);

create table public.soul_care_visits (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.soul_care_contacts (id) on delete cascade,
  logged_by text,
  logged_by_id uuid references public.profiles (id),
  visit_type text not null check (visit_type in ('Home (Periodic)', 'Celebration', 'Pastoral Care', 'Welfare Check', 'Phone Call')),
  reason_for_care text,
  urgency text check (urgency in ('High', 'Medium', 'Low')),
  visit_status text not null check (visit_status in ('Scheduled', 'Completed', 'Rescheduled', 'Member Unavailable')),
  visit_date date,
  visit_time time,
  meeting_notes text,
  visit_photo_url text,
  material_support boolean not null default false,
  material_support_notes text,
  prayer_requests text,
  testimony text,
  follow_up_required boolean not null default false,
  next_follow_up_date date,
  escalate_to_pastorate boolean not null default false,
  escalation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index soul_care_contacts_phone_idx on public.soul_care_contacts (phone);
create index soul_care_assignments_assigned_to_idx on public.soul_care_assignments (assigned_to);
create index soul_care_visits_contact_idx on public.soul_care_visits (contact_id);
create index soul_care_visits_escalated_idx on public.soul_care_visits (escalate_to_pastorate) where escalate_to_pastorate = true;

create trigger soul_care_contacts_touch_updated_at before update on public.soul_care_contacts for each row execute function public.touch_updated_at();
create trigger soul_care_visits_touch_updated_at before update on public.soul_care_visits for each row execute function public.touch_updated_at();

alter table public.soul_care_contacts enable row level security;
alter table public.soul_care_assignments enable row level security;
alter table public.soul_care_visits enable row level security;

create policy "soul_care_contacts_select" on public.soul_care_contacts for select
  using (public.current_role() in ('admin', 'soulcareadmin', 'soulcareteam'));
create policy "soul_care_contacts_write" on public.soul_care_contacts for all
  using (public.current_role() in ('admin', 'soulcareadmin', 'soulcareteam'))
  with check (public.current_role() in ('admin', 'soulcareadmin', 'soulcareteam'));

create policy "soul_care_assignments_select" on public.soul_care_assignments for select
  using (
    public.current_role() in ('admin', 'soulcareadmin')
    or assigned_to = auth.uid()
  );
create policy "soul_care_assignments_write" on public.soul_care_assignments for all
  using (public.current_role() in ('admin', 'soulcareadmin'))
  with check (public.current_role() in ('admin', 'soulcareadmin'));

create policy "soul_care_visits_select" on public.soul_care_visits for select
  using (
    public.current_role() in ('admin', 'soulcareadmin')
    or exists (select 1 from public.soul_care_assignments a where a.contact_id = soul_care_visits.contact_id and a.assigned_to = auth.uid())
  );
create policy "soul_care_visits_write" on public.soul_care_visits for insert
  with check (
    public.current_role() in ('admin', 'soulcareadmin')
    or exists (select 1 from public.soul_care_assignments a where a.contact_id = soul_care_visits.contact_id and a.assigned_to = auth.uid())
  );
create policy "soul_care_visits_update" on public.soul_care_visits for update
  using (
    public.current_role() in ('admin', 'soulcareadmin')
    or exists (select 1 from public.soul_care_assignments a where a.contact_id = soul_care_visits.contact_id and a.assigned_to = auth.uid())
  );
