-- Projects are separate from posts. Author policies match public.posts:
-- the admin email may read and write at any authenticator level, including aal1.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  description text not null default '',
  date date not null,
  image text not null default '',
  source_url text,
  tags text[] not null default '{}',
  images text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_key unique (slug),
  constraint projects_title_not_blank check (length(btrim(title)) > 0),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index projects_published_date_idx on public.projects (published, date desc);

alter table public.projects enable row level security;

create policy "Public read published"
  on public.projects
  for select
  using (published = true);

create policy "Author read all"
  on public.projects
  for select
  to authenticated
  using (((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com');

create policy "Author insert"
  on public.projects
  for insert
  to authenticated
  with check (((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com');

create policy "Author update"
  on public.projects
  for update
  to authenticated
  using (((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com');

create policy "Author delete"
  on public.projects
  for delete
  to authenticated
  using (((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com');

revoke all on table public.projects from public, anon, authenticated;
grant select on table public.projects to anon;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.projects to service_role;

insert into public.projects (
  title,
  slug,
  description,
  date,
  image,
  source_url,
  tags,
  images,
  published
) values (
  'My Portfolio Website',
  'portfolio-website',
  'Personal portfolio and blog built with SvelteKit, featuring a modern design and dark theme',
  '2026-03-20',
  '/assets/hero-bg.webp',
  'https://github.com/joshuafouch/my-website',
  array['sveltekit', 'tailwindcss', 'daisyui', 'mdsvex']::text[],
  '{}'::text[],
  true
)
on conflict (slug) do nothing;
