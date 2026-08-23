-- 0014_password_selfservice.sql

alter table public.access_requests add column if not exists user_id uuid references auth.users (id) on delete set null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::app_role, 'expteam'),
    not coalesce((new.raw_user_meta_data ->> 'pending')::boolean, false)
  );
  return new;
end;
$$;
