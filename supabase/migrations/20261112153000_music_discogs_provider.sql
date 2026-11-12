-- Switch favorite-music provider from Spotify to Discogs.

alter table public.music_artists
  drop constraint if exists music_artists_provider_check;
alter table public.music_albums
  drop constraint if exists music_albums_provider_check;
alter table public.music_songs
  drop constraint if exists music_songs_provider_check;

update public.music_artists
set provider = '',
    provider_id = '',
    image_url = null
where provider = 'spotify';

update public.music_albums
set provider = '',
    provider_id = '',
    image_url = null
where provider = 'spotify';

update public.music_songs
set provider = '',
    provider_id = '',
    image_url = null
where provider = 'spotify';

alter table public.music_artists
  add constraint music_artists_provider_check
  check (provider in ('', 'discogs'));

alter table public.music_albums
  add constraint music_albums_provider_check
  check (provider in ('', 'discogs'));

alter table public.music_songs
  add constraint music_songs_provider_check
  check (provider in ('', 'discogs'));
