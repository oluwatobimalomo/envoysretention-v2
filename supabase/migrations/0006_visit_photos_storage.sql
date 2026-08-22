-- Storage bucket for Soul Care visit photos

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
