-- About portraits: dedicated public bucket with professional/ and personal/ folders,
-- and a kind column so each about page loads its own set.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portraits',
  'portraits',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read portraits"
  on storage.objects
  for select
  using (bucket_id = 'portraits');

create policy "Author upload portraits"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portraits'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  );

create policy "Author update portraits"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portraits'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  )
  with check (
    bucket_id = 'portraits'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  );

create policy "Author delete portraits"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portraits'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  );

alter table public.portraits
  add column if not exists kind text not null default 'professional';

alter table public.portraits
  drop constraint if exists portraits_kind_check;

alter table public.portraits
  add constraint portraits_kind_check
  check (kind in ('professional', 'personal'));

create index if not exists portraits_kind_sort_order_idx
  on public.portraits (kind, sort_order);
