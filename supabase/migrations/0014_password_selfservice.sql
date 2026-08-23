-- ============================================================================
-- 0014_password_selfservice.sql
-- Access requests, revised:
--   1. The requester now chooses their own password at request time. The
--      Supabase Auth user is created immediately (Supabase stores the
--      password securely — our app never sees or stores it), but with
--      profiles.is_active = false via the 'pending' metadata flag below.
--      Approval simply flips is_active to true — no more temp-password
--      hand-off for this path.
--   2. access_requests now tracks which auth user it corresponds to, so
--      approve() can activate it and deny() can clean it up.
-- ============================================================================

alter table public.access_requests add column if not exists user_id uuid references auth.users (id) on delete set null;

-- Respect a 'pending' flag in signup metadata: self-service requests pass
-- pending=true (until approved), direct admin-created accounts and the
-- original request-access-with-immediate-approval flow omit it (defaults
-- to active), unchanged from migration 0001's behaviour otherwise.
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
