-- ============================================================================
-- 0003_call_pipeline.sql
-- Module 3: Experience Team call pipeline (Assign Calls, My Calls, Call
-- Queue, Completed Pipelines, 3-week Log Feedback, VIP Retention Overview).
-- Ported from V1's call_assignments / call_feedback / pipeline_overviews.
-- ============================================================================

create table public.call_assignments (
  id uuid primary key default gen_random_uuid(),
  first_timer_id uuid not null references public.first_timers (id) on delete cascade,
  assigned_to uuid not null references public.profiles (id),
  assigned_by uuid references public.profiles (id),
  assigned_at timestamptz not null default now(),
  unique (first_timer_id)
);

create table public.call_feedback (
  id uuid primary key default gen_random_uuid(),
  first_timer_id uuid not null references public.first_timers (id) on delete cascade,
  week_number smallint not null check (week_number between 1 and 3),
  call_status text not null check (call_status in ('Reached', 'Not Reached', 'Callback Requested', 'Wrong Number')),
  experience_rating text check (experience_rating in ('Excellent', 'Good', 'Average', 'Poor')),
  returning text check (returning in ('Yes', 'Maybe', 'No', 'Undecided')),
  notes text,
  follow_up_date date,
  caller_name text not null,
  caller_id uuid references public.profiles (id),
  flagged_for_pastoral boolean not null default false,
  flag_reason text,
  church_attendance text check (church_attendance in ('Present', 'Absent', 'Unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (first_timer_id, week_number)
);

create table public.pipeline_overviews (
  id uuid primary key default gen_random_uuid(),
  first_timer_id uuid not null references public.first_timers (id) on delete cascade,
  submitted_by text not null,
  submitted_by_id uuid references public.profiles (id),
  move_to_membership boolean not null,
  natural_groups text[],
  connect_center text,
  overview_notes text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (first_timer_id)
);

create index call_assignments_assigned_to_idx on public.call_assignments (assigned_to);
create index call_feedback_first_timer_idx on public.call_feedback (first_timer_id);
create index call_feedback_follow_up_idx on public.call_feedback (follow_up_date);
create index pipeline_overviews_first_timer_idx on public.pipeline_overviews (first_timer_id);

create trigger call_feedback_touch_updated_at before update on public.call_feedback for each row execute function public.touch_updated_at();
create trigger pipeline_overviews_touch_updated_at before update on public.pipeline_overviews for each row execute function public.touch_updated_at();

alter table public.call_assignments enable row level security;
alter table public.call_feedback enable row level security;
alter table public.pipeline_overviews enable row level security;

-- Assign Calls is admin/experienceadmin-only; My Calls (expteam) can only see their own assignment.
create policy "call_assignments_select" on public.call_assignments for select
  using (public.current_role() in ('admin', 'experienceadmin') or assigned_to = auth.uid());
create policy "call_assignments_write" on public.call_assignments for all
  using (public.current_role() in ('admin', 'experienceadmin'))
  with check (public.current_role() in ('admin', 'experienceadmin'));

-- Call feedback: admin/experienceadmin see all; expteam can read/write only
-- for contacts assigned to them.
create policy "call_feedback_select" on public.call_feedback for select
  using (
    public.current_role() in ('admin', 'experienceadmin')
    or exists (select 1 from public.call_assignments a where a.first_timer_id = call_feedback.first_timer_id and a.assigned_to = auth.uid())
  );
create policy "call_feedback_insert" on public.call_feedback for insert
  with check (
    public.current_role() in ('admin', 'experienceadmin')
    or exists (select 1 from public.call_assignments a where a.first_timer_id = call_feedback.first_timer_id and a.assigned_to = auth.uid())
  );
create policy "call_feedback_update" on public.call_feedback for update
  using (
    public.current_role() in ('admin', 'experienceadmin')
    or exists (select 1 from public.call_assignments a where a.first_timer_id = call_feedback.first_timer_id and a.assigned_to = auth.uid())
  );

create policy "pipeline_overviews_select" on public.pipeline_overviews for select
  using (public.current_role() in ('admin', 'experienceadmin', 'expteam'));
create policy "pipeline_overviews_write" on public.pipeline_overviews for insert
  with check (public.current_role() in ('admin', 'experienceadmin', 'expteam'));
create policy "pipeline_overviews_update" on public.pipeline_overviews for update
  using (public.current_role() in ('admin', 'experienceadmin', 'expteam'));

-- When a VIP Retention Overview recommends membership, mirror V1's
-- behaviour of setting first_timers.membership_decision = 'Member'.
create or replace function public.sync_membership_decision()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.move_to_membership then
    update public.first_timers set membership_decision = 'Member' where id = new.first_timer_id;
  end if;
  return new;
end;
$$;

create trigger pipeline_overviews_sync_membership
  after insert or update on public.pipeline_overviews
  for each row execute function public.sync_membership_decision();
