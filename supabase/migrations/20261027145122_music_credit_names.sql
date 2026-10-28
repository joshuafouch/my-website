-- Album and song credits are typed names, not links to other rows.

alter table public.music_albums
  add column artist_name text not null default '';

alter table public.music_songs
  add column artist_name text not null default '';

alter table public.music_songs
  add column album_name text not null default '';

update public.music_albums as album
set artist_name = artist.name
from public.music_artists as artist
where album.artist_id = artist.id;

update public.music_songs as song
set artist_name = artist.name
from public.music_artists as artist
where song.artist_id = artist.id;

update public.music_songs as song
set album_name = album.title
from public.music_albums as album
where song.album_id = album.id;

drop index if exists public.music_albums_artist_id_idx;
drop index if exists public.music_songs_artist_id_idx;
drop index if exists public.music_songs_album_id_idx;

alter table public.music_albums drop column artist_id;
alter table public.music_songs drop column artist_id, drop column album_id;
