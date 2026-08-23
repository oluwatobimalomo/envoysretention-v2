-- ============================================================================
-- 0015_church_members.sql
-- Module 5b: Membership Records — the full-congregation registry (Members
-- and Stewards), distinct from the Soul Care visit pool (soul_care_contacts).
-- "Last Visitation"/"Last Call" and "In Pool" status are DERIVED at query
-- time by matching phone numbers against soul_care_contacts/soul_care_visits
-- — matches V1's behaviour exactly, no data duplication.
-- ============================================================================

create table public.church_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  gender text check (gender in ('Male', 'Female')),
  dob date,
  marital_status text check (marital_status in ('Single', 'Married', 'Divorced', 'Widowed')),
  life_stage text check (life_stage in ('Student', 'Employee', 'Business Owner')),
  category text not null default 'Member' check (category in ('Steward', 'Member')),
  membership_status text not null default 'Active' check (membership_status in ('Active', 'Inactive', 'Travelled')),
  date_joined date,
  house_address text,
  nearest_landmark text,
  added_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index church_members_category_idx on public.church_members (category);
create index church_members_status_idx on public.church_members (membership_status);
create index church_members_phone_idx on public.church_members (phone);
create index church_members_full_name_idx on public.church_members using gin (to_tsvector('simple', full_name));

alter table public.church_members enable row level security;

create policy "church_members_select" on public.church_members for select
  using (public.current_role() in ('admin', 'soulcareadmin', 'soulcareteam'));
create policy "church_members_write" on public.church_members for insert
  with check (public.current_role() in ('admin', 'soulcareadmin'));
create policy "church_members_update" on public.church_members for update
  using (public.current_role() in ('admin', 'soulcareadmin'))
  with check (public.current_role() in ('admin', 'soulcareadmin'));
