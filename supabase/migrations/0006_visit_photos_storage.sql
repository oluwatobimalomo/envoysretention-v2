-- ============================================================================
-- 0006_visit_photos_storage.sql
-- Storage bucket for Soul Care visit photos (V1 uploaded these directly
-- to a public bucket via the anon key; V2 scopes uploads/reads to Soul
-- Care roles via RLS on storage.objects instead).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('visit-photos', 'visit-photos', true)
on conflict (id) do nothing;

create policy "visit_photos_read_public"
  on storage.objects for select
  using (bucket_id = 'visit-photos');

create policy "visit_photos_write_soulcare"
  on storage.objects for insert
  with check (
    bucket_id = 'visit-photos'
    and public.current_role() in ('admin', 'soulcareadmin', 'soulcareteam')
  );
