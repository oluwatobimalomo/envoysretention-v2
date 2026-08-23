-- Module 11: Connect Centre
create table public.connect_centre_prospects (
  id uuid primary key default gen_random_uuid(),
  original_first_timer_id uuid not null references public.first_timers (id) on delete cascade,
  full_name text not null,
  phone text,
  gender text,
  dob date,
  life_stage text,
  connect_center text not null,
  natural_groups text[],
  confirmed boolean not null default false,
  confirmed_by uuid references public.profiles (id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (original_first_timer_id)
);

create index connect_centre_prospects_center_idx on public.connect_centre_prospects (connect_center);
create index connect_centre_prospects_confirmed_idx on public.connect_centre_prospects (confirmed);

alter table public.connect_centre_prospects enable row level security;

create policy "connect_centre_prospects_select" on public.connect_centre_prospects for select
  using (public.current_role() in ('admin', 'connectcentre'));
create policy "connect_centre_prospects_update" on public.connect_centre_prospects for update
  using (public.current_role() in ('admin', 'connectcentre'))
  with check (public.current_role() in ('admin', 'connectcentre'));

-- Auto-populate from the VIP Retention Overview whenever a connect_center
-- is recommended. Re-running an overview (e.g. edited later) updates the
-- center/groups but never resets an existing confirmation.
create or replace function public.sync_connect_centre_prospect()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ft record;
begin
  if new.connect_center is null or new.connect_center = '' then
    return new;
  end if;

  select full_name, phone, gender, dob, life_stage into ft
  from public.first_timers where id = new.first_timer_id;

  insert into public.connect_centre_prospects (
    original_first_timer_id, full_name, phone, gender, dob, life_stage, connect_center, natural_groups
  )
  values (
    new.first_timer_id, ft.full_name, ft.phone, ft.gender, ft.dob, ft.life_stage, new.connect_center, new.natural_groups
  )
  on conflict (original_first_timer_id) do update set
    connect_center = excluded.connect_center,
    natural_groups = excluded.natural_groups;

  return new;
end;
$$;

create trigger pipeline_overviews_sync_connect_centre
  after insert or update on public.pipeline_overviews
  for each row execute function public.sync_connect_centre_prospect();
