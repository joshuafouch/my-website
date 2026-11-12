-- Spotify (or other catalog) enrichment fields for curated favorite music.
-- image_url holds a CDN cover; image_id remains for locally uploaded covers.

alter table public.music_artists
  add column if not exists provider text not null default '',
  add column if not exists provider_id text not null default '',
  add column if not exists image_url text;

alter table public.music_albums
  add column if not exists provider text not null default '',
  add column if not exists provider_id text not null default '',
  add column if not exists image_url text;

alter table public.music_songs
  add column if not exists provider text not null default '',
  add column if not exists provider_id text not null default '',
  add column if not exists image_url text;

alter table public.music_artists
  drop constraint if exists music_artists_provider_check;
alter table public.music_artists
  add constraint music_artists_provider_check
  check (provider in ('', 'spotify'));

alter table public.music_albums
  drop constraint if exists music_albums_provider_check;
alter table public.music_albums
  add constraint music_albums_provider_check
  check (provider in ('', 'spotify'));

alter table public.music_songs
  drop constraint if exists music_songs_provider_check;
alter table public.music_songs
  add constraint music_songs_provider_check
  check (provider in ('', 'spotify'));

alter table public.music_artists
  drop constraint if exists music_artists_image_url_https;
alter table public.music_artists
  add constraint music_artists_image_url_https
  check (image_url is null or image_url ~* '^https://');

alter table public.music_albums
  drop constraint if exists music_albums_image_url_https;
alter table public.music_albums
  add constraint music_albums_image_url_https
  check (image_url is null or image_url ~* '^https://');

alter table public.music_songs
  drop constraint if exists music_songs_image_url_https;
alter table public.music_songs
  add constraint music_songs_image_url_https
  check (image_url is null or image_url ~* '^https://');
