import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '#lib/database.types.ts';

type Client = SupabaseClient<Database>;

export type Org = { name: string; href: string };
export type PortraitKind = 'professional' | 'personal';
export type Portrait = { id: string; src: string; alt: string };
export const PORTRAITS_BUCKET = 'portraits';
export type Job = {
  id: string;
  role: string;
  timeSpan: string;
  body: string;
  skills: string[];
  orgs: Org[];
};
export type TechItem = { text: string; href: string };
export type TechGroup = { id: string; title: string; items: TechItem[] };
export const ALBUMS_BUCKET = 'albums';

export type MusicImage = {
  id: string;
  url: string;
  alt: string;
};
export type MusicProvider = '' | 'discogs';
export type MusicArtist = {
  id: string;
  name: string;
  note: string;
  url: string;
  imageId: string;
  provider: MusicProvider;
  providerId: string;
  imageUrl: string;
};
export type MusicAlbum = {
  id: string;
  title: string;
  artistName: string;
  note: string;
  url: string;
  imageId: string;
  provider: MusicProvider;
  providerId: string;
  imageUrl: string;
};
export type MusicSong = {
  id: string;
  title: string;
  artistName: string;
  albumName: string;
  note: string;
  url: string;
  imageId: string;
  provider: MusicProvider;
  providerId: string;
  imageUrl: string;
};
export type MusicLibrary = {
  images: MusicImage[];
  artists: MusicArtist[];
  albums: MusicAlbum[];
  songs: MusicSong[];
};

export function emptyLibrary(): MusicLibrary {
  return { images: [], artists: [], albums: [], songs: [] };
}

export function musicImageUrl(supabase: Client, path: string): string {
  const { data } = supabase.storage.from(ALBUMS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function musicCoverUrl(
  imageUrl: string,
  imageId: string,
  images: Map<string, string>
): string {
  return imageUrl || images.get(imageId) || '';
}

export function asProvider(value: string | null | undefined): MusicProvider {
  return value === 'discogs' ? 'discogs' : '';
}

export type ProfessionalContent = {
  intro: string;
  workIntro: string;
  techIntro: string;
  portraits: Portrait[];
  jobs: Job[];
  groups: TechGroup[];
};

export type PersonalContent = {
  intro: string;
  youtubeUrl: string;
  portraits: Portrait[];
  library: MusicLibrary;
};

function readOrgs(value: Json): Org[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const href = typeof item.href === 'string' ? item.href.trim() : '';
    if (!name) return [];
    return [{ name, href }];
  });
}

function readItems(value: Json): TechItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const text = typeof item.text === 'string' ? item.text.trim() : '';
    const href = typeof item.href === 'string' ? item.href.trim() : '';
    if (!text) return [];
    return [{ text, href }];
  });
}

async function loadPortraits(supabase: Client, kind: PortraitKind): Promise<Portrait[]> {
  const { data, error: portraitsError } = await supabase
    .from('portraits')
    .select('id, src, alt, sort_order')
    .eq('kind', kind)
    .order('sort_order');

  if (portraitsError) {
    console.error(`Failed to load ${kind} portraits`, portraitsError);
    error(500, 'Failed to load the about page');
  }

  return (data ?? []).map((portrait) => ({
    id: portrait.id,
    src: portrait.src,
    alt: portrait.alt
  }));
}

export async function loadProfessional(supabase: Client): Promise<ProfessionalContent> {
  const [profile, portraits, work, groups] = await Promise.all([
    supabase
      .from('about_professional')
      .select('intro, work_intro, tech_intro')
      .eq('id', 1)
      .maybeSingle(),
    loadPortraits(supabase, 'professional'),
    supabase
      .from('work_experiences')
      .select('id, role, time_span, body, skills, orgs, sort_order')
      .order('sort_order'),
    supabase.from('tech_groups').select('id, title, items, sort_order').order('sort_order')
  ]);

  if (profile.error || work.error || groups.error) {
    console.error('Failed to load professional about', profile.error, work.error, groups.error);
    error(500, 'Failed to load the about page');
  }

  return {
    intro: profile.data?.intro ?? '',
    workIntro: profile.data?.work_intro ?? '',
    techIntro: profile.data?.tech_intro ?? '',
    portraits,
    jobs: (work.data ?? []).map((job) => ({
      id: job.id,
      role: job.role,
      timeSpan: job.time_span,
      body: job.body,
      skills: job.skills ?? [],
      orgs: readOrgs(job.orgs)
    })),
    groups: (groups.data ?? []).map((group) => ({
      id: group.id,
      title: group.title,
      items: readItems(group.items)
    }))
  };
}

export async function loadMusicLibrary(supabase: Client): Promise<MusicLibrary | null> {
  const [images, artists, albums, songs] = await Promise.all([
    supabase.from('music_images').select('id, path, alt, created_at').order('created_at', {
      ascending: false
    }),
    supabase
      .from('music_artists')
      .select('id, name, note, url, image_id, provider, provider_id, image_url, sort_order')
      .order('sort_order'),
    supabase
      .from('music_albums')
      .select(
        'id, title, artist_name, note, url, image_id, provider, provider_id, image_url, sort_order'
      )
      .order('sort_order'),
    supabase
      .from('music_songs')
      .select(
        'id, title, artist_name, album_name, note, url, image_id, provider, provider_id, image_url, sort_order'
      )
      .order('sort_order')
  ]);

  if (images.error || artists.error || albums.error || songs.error) {
    console.error(
      'Failed to load music library',
      images.error,
      artists.error,
      albums.error,
      songs.error
    );
    return null;
  }

  return {
    images: (images.data ?? []).map((image) => ({
      id: image.id,
      url: musicImageUrl(supabase, image.path),
      alt: image.alt
    })),
    artists: (artists.data ?? []).map((artist) => ({
      id: artist.id,
      name: artist.name,
      note: artist.note,
      url: artist.url ?? '',
      imageId: artist.image_id ?? '',
      provider: asProvider(artist.provider),
      providerId: artist.provider_id ?? '',
      imageUrl: artist.image_url ?? ''
    })),
    albums: (albums.data ?? []).map((album) => ({
      id: album.id,
      title: album.title,
      artistName: album.artist_name,
      note: album.note,
      url: album.url ?? '',
      imageId: album.image_id ?? '',
      provider: asProvider(album.provider),
      providerId: album.provider_id ?? '',
      imageUrl: album.image_url ?? ''
    })),
    songs: (songs.data ?? []).map((song) => ({
      id: song.id,
      title: song.title,
      artistName: song.artist_name,
      albumName: song.album_name,
      note: song.note,
      url: song.url ?? '',
      imageId: song.image_id ?? '',
      provider: asProvider(song.provider),
      providerId: song.provider_id ?? '',
      imageUrl: song.image_url ?? ''
    }))
  };
}

export async function loadPersonal(supabase: Client): Promise<PersonalContent> {
  const [profile, portraits, library] = await Promise.all([
    supabase.from('about_personal').select('intro, youtube_url').eq('id', 1).maybeSingle(),
    loadPortraits(supabase, 'personal'),
    loadMusicLibrary(supabase)
  ]);

  if (profile.error || !library) {
    console.error('Failed to load personal about', profile.error);
    error(500, 'Failed to load the about page');
  }

  return {
    intro: profile.data?.intro ?? '',
    youtubeUrl: profile.data?.youtube_url ?? '',
    portraits,
    library
  };
}
