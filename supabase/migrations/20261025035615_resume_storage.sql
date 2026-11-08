-- Resume PDF lives in its own public bucket because blog-images only accepts images.
-- public.resume points the site at the current file. A null path keeps the static PDF.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', true, 10485760, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read resumes"
  on storage.objects
  for select
  using (bucket_id = 'resumes');

create policy "Author upload resumes"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  );

create policy "Author update resumes"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  )
  with check (
    bucket_id = 'resumes'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  );

create policy "Author delete resumes"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  );

create table public.resume (
  id smallint primary key default 1,
  path text,
  filename text not null default 'jf_resume.pdf',
  updated_at timestamptz not null default now(),
  constraint resume_singleton check (id = 1),
  constraint resume_filename_not_blank check (length(btrim(filename)) > 0)
);

alter table public.resume enable row level security;

create policy "Public read"
  on public.resume
  for select
  using (true);

create policy "Author insert"
  on public.resume
  for insert
  to authenticated
  with check (((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com');

create policy "Author update"
  on public.resume
  for update
  to authenticated
  using (((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com');

revoke all on table public.resume from public, anon, authenticated;
grant select on table public.resume to anon;
grant select, insert, update on table public.resume to authenticated;
grant select, insert, update, delete on table public.resume to service_role;

insert into public.resume (id) values (1) on conflict (id) do nothing;
