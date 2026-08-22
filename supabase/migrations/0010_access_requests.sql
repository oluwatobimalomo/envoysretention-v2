-- ============================================================================
-- 0010_access_requests.sql
-- Self-service "Request Access" — a prospective staff member submits their
-- details from the public login page; an admin reviews and approves (which
-- creates their real login) or denies. Ported from V1's "New team member?
-- Request access" flow, which V2 was missing entirely until now.
-- ============================================================================

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  requested_role app_role not null,
  message text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Denied')),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  denial_reason text,
  created_at timestamptz not null default now()
);

create index access_requests_status_idx on public.access_requests (status);

alter table public.access_requests enable row level security;

-- Anyone can submit a request (public form, no login).
create policy "access_requests_insert_public"
  on public.access_requests for insert
  to anon
  with check (true);

-- Only admins can see or act on the queue.
create policy "access_requests_select_admin"
  on public.access_requests for select
  using (public.is_admin());

create policy "access_requests_update_admin"
  on public.access_requests for update
  using (public.is_admin())
  with check (public.is_admin());
