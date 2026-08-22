-- ============================================================================
-- 0004_vip_contact.sql
-- Module 4: VIP Contact — WhatsApp welcome outreach to first-timers.
-- Ported from V1's vip_message_assignments table.
-- ============================================================================

create table public.vip_message_assignments (
  id uuid primary key default gen_random_uuid(),
  first_timer_id uuid not null references public.first_timers (id) on delete cascade,
  assigned_to uuid references public.profiles (id),
  assigned_by uuid references public.profiles (id),
  messaged boolean not null default false,
  messaged_by uuid references public.profiles (id),
  messaged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (first_timer_id)
);

create index vip_message_assignments_assigned_to_idx on public.vip_message_assignments (assigned_to);

create trigger vip_message_assignments_touch_updated_at
  before update on public.vip_message_assignments
  for each row execute function public.touch_updated_at();

alter table public.vip_message_assignments enable row level security;

create policy "vip_message_assignments_select" on public.vip_message_assignments for select
  using (public.current_role() in ('admin', 'dofficer', 'experienceadmin', 'expteam'));
create policy "vip_message_assignments_write" on public.vip_message_assignments for all
  using (public.current_role() in ('admin', 'dofficer', 'experienceadmin', 'expteam'))
  with check (public.current_role() in ('admin', 'dofficer', 'experienceadmin', 'expteam'));
