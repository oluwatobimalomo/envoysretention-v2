-- ============================================================================
-- 0017_envoys_visitors.sql
-- "Envoys Visitors" — a read-only archive of first-timers NOT recommended
-- for membership at the end of their 3-week pipeline, auto-populated by a
-- trigger (same pattern as connect_centre_prospects in 0013). Staff never
-- write rows here directly — only Restore, which clears their overview so
-- they re-enter the active pipeline for a fresh recommendation.
-- ============================================================================

create table public.envoys_visitors (
  id uuid primary key default gen_random_uuid(),
  original_first_timer_id uuid not null references public.first_timers (id) on delete cascade,
  full_name text not null,
  phone text,
  gender text,
  life_stage text,
  natural_groups text[],
  moved_at timestamptz not null default now(),
  restored_at timestamptz,
  unique (original_first_timer_id)
);

create index envoys_visitors_moved_at_idx on public.envoys_visitors (moved_at desc);

alter table public.envoys_visitors enable row level security;

create policy "envoys_visitors_select" on public.envoys_visitors for select
  using (public.current_role() in ('admin', 'experienceadmin'));
create policy "envoys_visitors_update" on public.envoys_visitors for update
  using (public.current_role() in ('admin', 'experienceadmin'))
  with check (public.current_role() in ('admin', 'experienceadmin'));

create or replace function public.sync_envoys_visitor()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ft record;
begin
  if new.move_to_membership then
    return new;
  end if;

  select full_name, phone, gender, life_stage into ft
  from public.first_timers where id = new.first_timer_id;

  insert into public.envoys_visitors (original_first_timer_id, full_name, phone, gender, life_stage, natural_groups, moved_at, restored_at)
  values (new.first_timer_id, ft.full_name, ft.phone, ft.gender, ft.life_stage, new.natural_groups, now(), null)
  on conflict (original_first_timer_id) do update set
    moved_at = now(),
    restored_at = null,
    natural_groups = excluded.natural_groups;

  return new;
end;
$$;

create trigger pipeline_overviews_sync_envoys_visitor
  after insert or update on public.pipeline_overviews
  for each row execute function public.sync_envoys_visitor();
