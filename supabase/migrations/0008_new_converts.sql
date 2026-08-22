-- Module 7: New Converts 
create table public.new_converts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  gender text check (gender in ('Male', 'Female')),
  conversion_type text not null default 'New Salvation' check (conversion_type in ('New Salvation', 'Rededication')),
  conversion_date date not null default current_date,
  source text not null default 'Manual' check (source in ('Manual', 'Public Form')),
  added_by uuid references public.profiles (id),
  envoys_training_completed boolean not null default false,
  envoys_training_completed_date date,
  training_scheduled_date date,
  trainer_name text,
  envoys_training_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.new_converts_assignments (
  id uuid primary key default gen_random_uuid(),
  new_convert_id uuid not null references public.new_converts (id) on delete cascade,
  assigned_to uuid not null references public.profiles (id),
  assigned_by uuid references public.profiles (id),
  assigned_at timestamptz not null default now(),
  unique (new_convert_id)
);

create table public.new_converts_checkins (
  id uuid primary key default gen_random_uuid(),
  new_convert_id uuid not null references public.new_converts (id) on delete cascade,
  checkin_number smallint not null check (checkin_number between 1 and 3),
  call_status text not null check (call_status in ('Reached', 'Not Reached', 'Callback Requested', 'Wrong Number')),
  notes text,
  follow_up_date date,
  caller_name text,
  caller_id uuid references public.profiles (id),
  flagged_for_pastoral boolean not null default false,
  flag_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (new_convert_id, checkin_number)
);

create index new_converts_conversion_date_idx on public.new_converts (conversion_date desc);
create index new_converts_phone_idx on public.new_converts (phone);
create index new_converts_assignments_assigned_to_idx on public.new_converts_assignments (assigned_to);
create index new_converts_checkins_nc_idx on public.new_converts_checkins (new_convert_id);

create trigger new_converts_touch_updated_at before update on public.new_converts for each row execute function public.touch_updated_at();
create trigger new_converts_checkins_touch_updated_at before update on public.new_converts_checkins for each row execute function public.touch_updated_at();

alter table public.new_converts enable row level security;
alter table public.new_converts_assignments enable row level security;
alter table public.new_converts_checkins enable row level security;

create policy "new_converts_select" on public.new_converts for select
  using (public.current_role() in ('admin', 'dofficer', 'soulcareadmin', 'soulcareteam'));
create policy "new_converts_insert_staff" on public.new_converts for insert
  with check (public.current_role() in ('admin', 'dofficer', 'soulcareadmin'));
create policy "new_converts_update_staff" on public.new_converts for update
  using (public.current_role() in ('admin', 'dofficer', 'soulcareadmin'))
  with check (public.current_role() in ('admin', 'dofficer', 'soulcareadmin'));

-- Public self-registration (QR form, no login) — mirrors first_timers.
create policy "new_converts_insert_public" on public.new_converts for insert
  to anon
  with check (true);

create policy "new_converts_assignments_select" on public.new_converts_assignments for select
  using (public.current_role() in ('admin', 'soulcareadmin') or assigned_to = auth.uid());
create policy "new_converts_assignments_write" on public.new_converts_assignments for all
  using (public.current_role() in ('admin', 'soulcareadmin'))
  with check (public.current_role() in ('admin', 'soulcareadmin'));

create policy "new_converts_checkins_select" on public.new_converts_checkins for select
  using (
    public.current_role() in ('admin', 'soulcareadmin')
    or exists (select 1 from public.new_converts_assignments a where a.new_convert_id = new_converts_checkins.new_convert_id and a.assigned_to = auth.uid())
  );
create policy "new_converts_checkins_insert" on public.new_converts_checkins for insert
  with check (
    public.current_role() in ('admin', 'soulcareadmin')
    or exists (select 1 from public.new_converts_assignments a where a.new_convert_id = new_converts_checkins.new_convert_id and a.assigned_to = auth.uid())
  );
create policy "new_converts_checkins_update" on public.new_converts_checkins for update
  using (
    public.current_role() in ('admin', 'soulcareadmin')
    or exists (select 1 from public.new_converts_assignments a where a.new_convert_id = new_converts_checkins.new_convert_id and a.assigned_to = auth.uid())
  );
