-- ============================================================================
-- 0009_megastars.sql
-- Module 8: Megastars — children's ministry: guardians, children, guardian
-- links (many-to-many, since a child can have multiple guardians and a
-- guardian multiple children), services (a service must be "Open" before
-- check-in can happen), and check-ins/outs.
-- Ported from V1's megastars / megastar_guardians / megastar_guardian_links
-- / megastar_services / megastar_checkins.
-- ============================================================================

create table public.megastar_guardians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  added_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.megastars (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  gender text check (gender in ('Male', 'Female')),
  dob date,
  class text check (class in ('Nursery', 'Toddlers', 'Pre-K', 'Grade 1-2', 'Grade 3-5', 'Teens')),
  is_active boolean not null default true,
  removed_reason text,
  removed_at timestamptz,
  added_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.megastar_guardian_links (
  id uuid primary key default gen_random_uuid(),
  megastar_id uuid not null references public.megastars (id) on delete cascade,
  guardian_id uuid not null references public.megastar_guardians (id) on delete cascade,
  relationship text check (relationship in ('Parent', 'Grandparent', 'Guardian', 'Other')),
  unique (megastar_id, guardian_id)
);

create table public.megastar_services (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  service_date date not null default current_date,
  status text not null default 'Open' check (status in ('Open', 'Closed')),
  created_by uuid references public.profiles (id),
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.megastar_checkins (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.megastar_services (id) on delete cascade,
  megastar_id uuid not null references public.megastars (id) on delete cascade,
  guardian_id uuid not null references public.megastar_guardians (id),
  class_at_checkin text,
  checked_in_by uuid references public.profiles (id),
  check_in_time timestamptz not null default now(),
  check_out_time timestamptz,
  checked_out_by uuid references public.profiles (id),
  checkout_guardian_id uuid references public.megastar_guardians (id)
);

create index megastar_guardians_phone_idx on public.megastar_guardians (phone);
create index megastars_full_name_idx on public.megastars using gin (to_tsvector('simple', full_name));
create index megastar_guardian_links_megastar_idx on public.megastar_guardian_links (megastar_id);
create index megastar_guardian_links_guardian_idx on public.megastar_guardian_links (guardian_id);
create index megastar_checkins_service_idx on public.megastar_checkins (service_id);
create index megastar_checkins_active_idx on public.megastar_checkins (service_id) where check_out_time is null;

alter table public.megastar_guardians enable row level security;
alter table public.megastars enable row level security;
alter table public.megastar_guardian_links enable row level security;
alter table public.megastar_services enable row level security;
alter table public.megastar_checkins enable row level security;

-- All Megastars-facing roles (megastars, megastarsadmin) plus admin/dofficer
-- (who both had this module in V1's nav) can read/write freely — this is a
-- front-desk operational tool, not something needing per-row restriction.
create policy "megastar_guardians_all" on public.megastar_guardians for all
  using (public.current_role() in ('admin', 'dofficer', 'megastars', 'megastarsadmin'))
  with check (public.current_role() in ('admin', 'dofficer', 'megastars', 'megastarsadmin'));

create policy "megastars_all" on public.megastars for all
  using (public.current_role() in ('admin', 'dofficer', 'megastars', 'megastarsadmin'))
  with check (public.current_role() in ('admin', 'dofficer', 'megastars', 'megastarsadmin'));

create policy "megastar_guardian_links_all" on public.megastar_guardian_links for all
  using (public.current_role() in ('admin', 'dofficer', 'megastars', 'megastarsadmin'))
  with check (public.current_role() in ('admin', 'dofficer', 'megastars', 'megastarsadmin'));

-- Only admins can open/close services — everyone else just reads status.
create policy "megastar_services_select" on public.megastar_services for select
  using (public.current_role() in ('admin', 'dofficer', 'megastars', 'megastarsadmin'));
create policy "megastar_services_write" on public.megastar_services for all
  using (public.current_role() in ('admin', 'dofficer', 'megastarsadmin'))
  with check (public.current_role() in ('admin', 'dofficer', 'megastarsadmin'));

create policy "megastar_checkins_all" on public.megastar_checkins for all
  using (public.current_role() in ('admin', 'dofficer', 'megastars', 'megastarsadmin'))
  with check (public.current_role() in ('admin', 'dofficer', 'megastars', 'megastarsadmin'));
