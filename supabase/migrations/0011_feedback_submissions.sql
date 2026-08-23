-- Module 9: General Feedback
create table public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  name text,
  gender text check (gender in ('Male', 'Female')),
  phone text,
  membership_status text check (membership_status in ('Member', 'Steward')),
  focus_points jsonb not null default '[]'::jsonb,
  feedback text not null,
  submitted_at timestamptz not null default now()
);

create index feedback_submissions_submitted_at_idx on public.feedback_submissions (submitted_at desc);

alter table public.feedback_submissions enable row level security;

-- Fully public submission — no login required, matches V1's open form.
-- No update/delete policy for anyone but admins via direct DB access,
-- since these are member-submitted and shouldn't be editable by staff.
create policy "feedback_submissions_insert_public"
  on public.feedback_submissions for insert
  to anon
  with check (true);

create policy "feedback_submissions_select_staff"
  on public.feedback_submissions for select
  using (public.current_role() in ('admin', 'experienceadmin', 'research'));
