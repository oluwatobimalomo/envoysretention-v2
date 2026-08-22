-- ============================================================================
-- 0007_potential_envoys.sql
-- Module 6: Potential Envoys — the 5-week post-membership track for people
-- recommended for membership in their VIP Retention Overview. Ported from
-- V1's potential_envoys / potential_envoys_feedback / potential_envoys_assignments.
-- ============================================================================

create table public.potential_envoys (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  gender text check (gender in ('Male', 'Female')),
  original_first_timer_id uuid references public.first_timers (id),
  training_completed boolean not null default false,
  training_completed_date date,
  training_notes text,
  promoted_to_membership boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.potential_envoys_assignments (
  id uuid primary key default gen_random_uuid(),
  potential_envoy_id uuid not null references public.potential_envoys (id) on delete cascade,
  assigned_to uuid not null references public.profiles (id),
  assigned_by uuid references public.profiles (id),
  assigned_at timestamptz not null default now(),
  unique (potential_envoy_id)
);

create table public.potential_envoys_feedback (
  id uuid primary key default gen_random_uuid(),
  potential_envoy_id uuid not null references public.potential_envoys (id) on delete cascade,
  week_number smallint not null check (week_number between 1 and 5),
  call_status text not null check (call_status in ('Reached', 'Not Reached', 'Callback Requested', 'Wrong Number')),
  notes text,
  follow_up_date date,
  caller_name text,
  caller_id uuid references public.profiles (id),
  flagged_for_pastoral boolean not null default false,
  flag_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (potential_envoy_id, week_number)
);

create index potential_envoys_assignments_assigned_to_idx on public.potential_envoys_assignments (assigned_to);
create index potential_envoys_feedback_pe_idx on public.potential_envoys_feedback (potential_envoy_id);

create trigger potential_envoys_touch_updated_at before update on public.potential_envoys for each row execute function public.touch_updated_at();
create trigger potential_envoys_feedback_touch_updated_at before update on public.potential_envoys_feedback for each row execute function public.touch_updated_at();

alter table public.potential_envoys enable row level security;
alter table public.potential_envoys_assignments enable row level security;
alter table public.potential_envoys_feedback enable row level security;

create policy "potential_envoys_select" on public.potential_envoys for select
  using (public.current_role() in ('admin', 'experienceadmin', 'soulcareadmin', 'soulcareteam'));
create policy "potential_envoys_write" on public.potential_envoys for all
  using (public.current_role() in ('admin', 'experienceadmin', 'soulcareadmin'))
  with check (public.current_role() in ('admin', 'experienceadmin', 'soulcareadmin'));

create policy "potential_envoys_assignments_select" on public.potential_envoys_assignments for select
  using (public.current_role() in ('admin', 'experienceadmin', 'soulcareadmin') or assigned_to = auth.uid());
create policy "potential_envoys_assignments_write" on public.potential_envoys_assignments for all
  using (public.current_role() in ('admin', 'experienceadmin', 'soulcareadmin'))
  with check (public.current_role() in ('admin', 'experienceadmin', 'soulcareadmin'));

create policy "potential_envoys_feedback_select" on public.potential_envoys_feedback for select
  using (
    public.current_role() in ('admin', 'experienceadmin', 'soulcareadmin')
    or exists (select 1 from public.potential_envoys_assignments a where a.potential_envoy_id = potential_envoys_feedback.potential_envoy_id and a.assigned_to = auth.uid())
  );
create policy "potential_envoys_feedback_write" on public.potential_envoys_feedback for insert
  with check (
    public.current_role() in ('admin', 'experienceadmin', 'soulcareadmin')
    or exists (select 1 from public.potential_envoys_assignments a where a.potential_envoy_id = potential_envoys_feedback.potential_envoy_id and a.assigned_to = auth.uid())
  );
create policy "potential_envoys_feedback_update" on public.potential_envoys_feedback for update
  using (
    public.current_role() in ('admin', 'experienceadmin', 'soulcareadmin')
    or exists (select 1 from public.potential_envoys_assignments a where a.potential_envoy_id = potential_envoys_feedback.potential_envoy_id and a.assigned_to = auth.uid())
  );
