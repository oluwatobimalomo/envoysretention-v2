-- ============================================================================
-- 0002_first_timers.sql
-- Module 2: First-Timers registry.
--
-- Ported 1:1 from V1's `first_timers` table (columns identified from
-- BLANK_FT / FirstTimerForm in EnvoysDashboard.jsx) with proper types,
-- constraints, and RLS in place of V1's "anon key, no rules" access.
-- ============================================================================

create table public.first_timers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  gender text check (gender in ('Male', 'Female')),
  dob date,
  marital_status text check (marital_status in ('Single', 'Married', 'Divorced', 'Widowed')),
  house_address text,
  nearest_landmark text,
  membership_decision text check (membership_decision in ('Member', 'Visitor', 'Undecided')),
  life_stage text check (life_stage in ('Student', 'Employee', 'Business Owner')),
  heard_from text,
  areas_of_interest jsonb not null default '[]'::jsonb,
  service_feedback text,
  service_date date not null default current_date,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index first_timers_service_date_idx on public.first_timers (service_date desc);
create index first_timers_phone_idx on public.first_timers (phone);
create index first_timers_full_name_idx on public.first_timers using gin (to_tsvector('simple', full_name));

create trigger first_timers_touch_updated_at
  before update on public.first_timers
  for each row execute function public.touch_updated_at();

alter table public.first_timers enable row level security;

-- Staff who work with First-Timers data can read all records.
create policy "first_timers_select_staff"
  on public.first_timers for select
  using (
    public.current_role() in (
      'admin', 'dofficer', 'experienceadmin', 'expteam', 'soulcareadmin', 'soulcareteam'
    )
  );

-- Data Officers and Admins manage the registry directly.
create policy "first_timers_insert_staff"
  on public.first_timers for insert
  with check (public.current_role() in ('admin', 'dofficer'));

create policy "first_timers_update_staff"
  on public.first_timers for update
  using (public.current_role() in ('admin', 'dofficer'))
  with check (public.current_role() in ('admin', 'dofficer'));

create policy "first_timers_delete_admin"
  on public.first_timers for delete
  using (public.current_role() = 'admin');

-- Public self-registration (QR code form, no login) — matches V1's fully
-- open registration form. Anyone can insert a new first-timer row but
-- cannot read, update, or delete existing ones through this policy.
create policy "first_timers_insert_public"
  on public.first_timers for insert
  to anon
  with check (true);
