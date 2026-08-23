-- Module 10: Testimony Bank
create table public.public_testimonies (
  id uuid primary key default gen_random_uuid(),
  name text,
  category text not null default 'General Testimony' check (
    category in ('General Testimony', 'Coronation Service Testimony', 'Upgrade Service Testimony')
  ),
  testimony text not null,
  submitted_at timestamptz not null default now()
);

create index public_testimonies_submitted_at_idx on public.public_testimonies (submitted_at desc);
create index public_testimonies_category_idx on public.public_testimonies (category);

alter table public.public_testimonies enable row level security;

create policy "public_testimonies_insert_public"
  on public.public_testimonies for insert
  to anon
  with check (true);

create policy "public_testimonies_select_staff"
  on public.public_testimonies for select
  using (public.current_role() in ('admin', 'testimonyteam', 'soulcareadmin'));
