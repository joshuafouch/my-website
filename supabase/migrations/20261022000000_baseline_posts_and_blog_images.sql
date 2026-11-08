-- Baseline for objects that were created in the dashboard before migrations existed: the posts
-- table and the blog-images bucket, with their RLS policies. Captured from production on
-- 2026-11-03 so the schema can be reviewed and rebuilt from migrations alone.
--
-- Idempotent: on the existing project this is a no-op (same definitions). Dated before the first
-- migration so a fresh database creates posts before later migrations (e.g. the MFA policies,
-- which cover every RLS table that exists when they run).

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text not null,
  date date not null default current_date,
  categories text[] not null default '{}',
  image text,
  body text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_slug_key unique (slug)
);

create index if not exists posts_published_date_idx on public.posts (published, date desc);

alter table public.posts enable row level security;

drop policy if exists "Public read published" on public.posts;
create policy "Public read published"
  on public.posts
  for select
  using (published = true);

drop policy if exists "Author read all" on public.posts;
create policy "Author read all"
  on public.posts
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'joshie.fouchie@gmail.com');

drop policy if exists "Author insert" on public.posts;
create policy "Author insert"
  on public.posts
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'joshie.fouchie@gmail.com');

drop policy if exists "Author update" on public.posts;
create policy "Author update"
  on public.posts
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'joshie.fouchie@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'joshie.fouchie@gmail.com');

drop policy if exists "Author delete" on public.posts;
create policy "Author delete"
  on public.posts
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'joshie.fouchie@gmail.com');

-- Blog images bucket (public URLs; uploads limited to the admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/*'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read blog-images" on storage.objects;
create policy "Public read blog-images"
  on storage.objects
  for select
  using (bucket_id = 'blog-images');

drop policy if exists "Author upload blog-images" on storage.objects;
create policy "Author upload blog-images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-images'
    and (auth.jwt() ->> 'email') = 'joshie.fouchie@gmail.com'
  );

drop policy if exists "Author update blog-images" on storage.objects;
create policy "Author update blog-images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'blog-images'
    and (auth.jwt() ->> 'email') = 'joshie.fouchie@gmail.com'
  )
  with check (
    bucket_id = 'blog-images'
    and (auth.jwt() ->> 'email') = 'joshie.fouchie@gmail.com'
  );

drop policy if exists "Author delete blog-images" on storage.objects;
create policy "Author delete blog-images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'blog-images'
    and (auth.jwt() ->> 'email') = 'joshie.fouchie@gmail.com'
  );
