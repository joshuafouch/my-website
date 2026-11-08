-- Favorite music: artists, albums, and songs, each optional and independent.
-- Covers live in the public albums bucket and are referenced from music_images.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('albums', 'albums', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read albums"
  on storage.objects
  for select
  using (bucket_id = 'albums');

create policy "Author upload albums"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'albums'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  );

create policy "Author update albums"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'albums'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  )
  with check (
    bucket_id = 'albums'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  );

create policy "Author delete albums"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'albums'
    and ((select auth.jwt()) ->> 'email') = 'joshie.fouchie@gmail.com'
  );

create table public.music_images (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  alt text not null default '',
  created_at timestamptz not null default now(),
  constraint music_images_path_not_blank check (length(btrim(path)) > 0),
  constraint music_images_path_unique unique (path)
);

create table public.music_artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  note text not null default '',
  url text,
  image_id uuid references public.music_images (id) on delete set null,
  sort_order integer not null default 0,
  constraint music_artists_name_not_blank check (length(btrim(name)) > 0)
);

create table public.music_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_id uuid references public.music_artists (id) on delete set null,
  note text not null default '',
  url text,
  image_id uuid references public.music_images (id) on delete set null,
  sort_order integer not null default 0,
  constraint music_albums_title_not_blank check (length(btrim(title)) > 0)
);

create table public.music_songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist_id uuid references public.music_artists (id) on delete set null,
  album_id uuid references public.music_albums (id) on delete set null,
  note text not null default '',
  url text,
  image_id uuid references public.music_images (id) on delete set null,
  sort_order integer not null default 0,
  constraint music_songs_title_not_blank check (length(btrim(title)) > 0)
);

create index music_artists_image_id_idx on public.music_artists (image_id);
create index music_albums_artist_id_idx on public.music_albums (artist_id);
create index music_albums_image_id_idx on public.music_albums (image_id);
create index music_songs_artist_id_idx on public.music_songs (artist_id);
create index music_songs_album_id_idx on public.music_songs (album_id);
create index music_songs_image_id_idx on public.music_songs (image_id);

do $$
declare
  t text;
  tables text[] := array['music_images', 'music_artists', 'music_albums', 'music_songs'];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant select on table public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on table public.%I to authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
    execute format('create policy %I on public.%I for select using (true)', 'Public read', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (((select auth.jwt()) ->> %L) = %L)',
      'Author insert',
      t,
      'email',
      'joshie.fouchie@gmail.com'
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (((select auth.jwt()) ->> %L) = %L) with check (((select auth.jwt()) ->> %L) = %L)',
      'Author update',
      t,
      'email',
      'joshie.fouchie@gmail.com',
      'email',
      'joshie.fouchie@gmail.com'
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (((select auth.jwt()) ->> %L) = %L)',
      'Author delete',
      t,
      'email',
      'joshie.fouchie@gmail.com'
    );
  end loop;
end
$$;

with image as (
  insert into public.music_images (path, alt)
  values ('the-bends.webp', 'The Bends by Radiohead')
  returning id
), artist as (
  insert into public.music_artists (name, image_id, sort_order)
  select 'Radiohead', image.id, 0 from image
  returning id
), album as (
  insert into public.music_albums (title, artist_id, image_id, sort_order)
  select 'The Bends', artist.id, image.id, 0
  from artist
  cross join image
  returning id
)
insert into public.music_songs (title, artist_id, album_id, image_id, sort_order)
select '(Nice Dream)', artist.id, album.id, image.id, 0
from artist
cross join album
cross join image;

drop table public.music_entries;
