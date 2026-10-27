import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ALBUMS_BUCKET,
  loadMusicLibrary,
  musicImageUrl,
  type Job,
  type MusicAlbum,
  type MusicArtist,
  type MusicImage,
  type MusicLibrary,
  type MusicSong,
  type Org,
  type PersonalContent,
  type Portrait,
  type ProfessionalContent,
  type TechGroup,
  type TechItem
} from '#lib/about.ts';
import type { Database, Json } from '#lib/database.types.ts';
import { safeHref } from '#lib/links.ts';
import { requireAdmin, uploadBlogImage } from '#lib/server/admin-posts.ts';

type Client = SupabaseClient<Database>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PortraitWire = { id: string; src: string; alt: string };
type JobWire = {
  id: string;
  role: string;
  timeSpan: string;
  body: string;
  skillsText: string;
  orgs: { name: string; href: string }[];
};
type GroupWire = { id: string; title: string; items: { text: string; href: string }[] };
type ArtistWire = { id: string; name: string; note: string; url: string; imageId: string };
type AlbumWire = {
  id: string;
  title: string;
  artistName: string;
  note: string;
  url: string;
  imageId: string;
};
type SongWire = {
  id: string;
  title: string;
  artistName: string;
  albumName: string;
  note: string;
  url: string;
  imageId: string;
};

const MUSIC_LIMIT = 80;
const COVER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_COVER_BYTES = 2 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseJson(raw: string): { ok: unknown } | { error: string } {
  try {
    return { ok: JSON.parse(raw) };
  } catch {
    return { error: 'That form could not be read. Try again.' };
  }
}

function checkId(value: unknown): { ok: string } | { error: string } {
  if (typeof value !== 'string' || !UUID.test(value)) return { error: 'A row id was invalid.' };
  return { ok: value };
}

function duplicate(ids: string[]): boolean {
  return new Set(ids).size !== ids.length;
}

function checkHref(value: string, label: string): { ok: string } | { error: string } {
  if (!value) return { ok: '' };
  if (value.length > 500) return { error: `${label} is too long.` };
  const safe = safeHref(value);
  if (!safe) return { error: `${label} needs a full http(s) link or a site path.` };
  return { ok: safe };
}

function splitSkills(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ];
}

function portraitFile(form: FormData, id: string): File | null {
  const file = form.get(`portrait-${id}`);
  return file instanceof File && file.size > 0 ? file : null;
}

function parsePortraits(value: unknown): { ok: PortraitWire[] } | { error: string } {
  if (!Array.isArray(value)) return { error: 'Portraits could not be read.' };
  if (value.length > 12) return { error: 'Keep portraits to 12 or fewer.' };
  const portraits: PortraitWire[] = [];
  for (const item of value) {
    if (!isRecord(item)) return { error: 'Portraits could not be read.' };
    const id = checkId(item.id);
    if ('error' in id) return id;
    const src = text(item.src);
    const alt = text(item.alt);
    if (src.length > 500 || alt.length > 160) return { error: 'A portrait field is too long.' };
    portraits.push({ id: id.ok, src, alt });
  }
  if (duplicate(portraits.map((portrait) => portrait.id))) {
    return { error: 'Each portrait needs its own id.' };
  }
  return { ok: portraits };
}

function parseJobs(value: unknown): { ok: JobWire[] } | { error: string } {
  if (!Array.isArray(value)) return { error: 'Work experience could not be read.' };
  if (value.length > 30) return { error: 'Keep work experience to 30 roles or fewer.' };
  const jobs: JobWire[] = [];
  for (const item of value) {
    if (!isRecord(item)) return { error: 'Work experience could not be read.' };
    const id = checkId(item.id);
    if ('error' in id) return id;
    if (!Array.isArray(item.orgs)) return { error: 'An organization list could not be read.' };
    if (item.orgs.length > 6) return { error: 'Keep organizations to 6 per role.' };
    const orgs = item.orgs.map((org) => {
      if (!isRecord(org)) return { name: '', href: '' };
      return { name: text(org.name), href: text(org.href) };
    });
    const role = text(item.role);
    const timeSpan = text(item.timeSpan);
    const body = text(item.body);
    const skillsText = text(item.skillsText);
    if (
      role.length > 160 ||
      timeSpan.length > 80 ||
      body.length > 4000 ||
      skillsText.length > 400
    ) {
      return { error: 'A work field is too long.' };
    }
    jobs.push({ id: id.ok, role, timeSpan, body, skillsText, orgs });
  }
  if (duplicate(jobs.map((job) => job.id))) return { error: 'Each role needs its own id.' };
  return { ok: jobs };
}

function parseGroups(value: unknown): { ok: GroupWire[] } | { error: string } {
  if (!Array.isArray(value)) return { error: 'Tech stack could not be read.' };
  if (value.length > 20) return { error: 'Keep tech groups to 20 or fewer.' };
  const groups: GroupWire[] = [];
  for (const item of value) {
    if (!isRecord(item)) return { error: 'Tech stack could not be read.' };
    const id = checkId(item.id);
    if ('error' in id) return id;
    if (!Array.isArray(item.items)) return { error: 'A tech group could not be read.' };
    if (item.items.length > 24) return { error: 'Keep each tech group to 24 items or fewer.' };
    const items = item.items.map((entry) => {
      if (!isRecord(entry)) return { text: '', href: '' };
      return { text: text(entry.text), href: text(entry.href) };
    });
    const title = text(item.title);
    if (title.length > 80 || items.some((entry) => entry.text.length > 80)) {
      return { error: 'A tech field is too long.' };
    }
    groups.push({ id: id.ok, title, items });
  }
  if (duplicate(groups.map((group) => group.id)))
    return { error: 'Each tech group needs its own id.' };
  return { ok: groups };
}

function optionalId(value: unknown): { ok: string } | { error: string } {
  if (typeof value !== 'string' || value.trim() === '') return { ok: '' };
  return checkId(value);
}

function parseArtists(value: unknown): { ok: ArtistWire[] } | { error: string } {
  if (!Array.isArray(value)) return { error: 'Artists could not be read.' };
  if (value.length > MUSIC_LIMIT) return { error: 'Keep artists to 80 or fewer.' };
  const artists: ArtistWire[] = [];
  for (const item of value) {
    if (!isRecord(item)) return { error: 'Artists could not be read.' };
    const id = checkId(item.id);
    if ('error' in id) return id;
    const imageId = optionalId(item.imageId);
    if ('error' in imageId) return imageId;
    const name = text(item.name);
    const note = text(item.note);
    const url = text(item.url);
    if (name.length > 160 || note.length > 500) return { error: 'An artist field is too long.' };
    artists.push({ id: id.ok, name, note, url, imageId: imageId.ok });
  }
  if (duplicate(artists.map((artist) => artist.id)))
    return { error: 'Each artist needs its own id.' };
  return { ok: artists };
}

function parseAlbums(value: unknown): { ok: AlbumWire[] } | { error: string } {
  if (!Array.isArray(value)) return { error: 'Albums could not be read.' };
  if (value.length > MUSIC_LIMIT) return { error: 'Keep albums to 80 or fewer.' };
  const albums: AlbumWire[] = [];
  for (const item of value) {
    if (!isRecord(item)) return { error: 'Albums could not be read.' };
    const id = checkId(item.id);
    if ('error' in id) return id;
    const imageId = optionalId(item.imageId);
    if ('error' in imageId) return imageId;
    const title = text(item.title);
    const artistName = text(item.artistName);
    const note = text(item.note);
    const url = text(item.url);
    if (title.length > 160 || artistName.length > 160 || note.length > 500) {
      return { error: 'An album field is too long.' };
    }
    albums.push({
      id: id.ok,
      title,
      artistName,
      note,
      url,
      imageId: imageId.ok
    });
  }
  if (duplicate(albums.map((album) => album.id))) return { error: 'Each album needs its own id.' };
  return { ok: albums };
}

function parseSongs(value: unknown): { ok: SongWire[] } | { error: string } {
  if (!Array.isArray(value)) return { error: 'Songs could not be read.' };
  if (value.length > MUSIC_LIMIT) return { error: 'Keep songs to 80 or fewer.' };
  const songs: SongWire[] = [];
  for (const item of value) {
    if (!isRecord(item)) return { error: 'Songs could not be read.' };
    const id = checkId(item.id);
    if ('error' in id) return id;
    const imageId = optionalId(item.imageId);
    if ('error' in imageId) return imageId;
    const title = text(item.title);
    const artistName = text(item.artistName);
    const albumName = text(item.albumName);
    const note = text(item.note);
    const url = text(item.url);
    if (
      title.length > 160 ||
      artistName.length > 160 ||
      albumName.length > 160 ||
      note.length > 500
    ) {
      return { error: 'A song field is too long.' };
    }
    songs.push({
      id: id.ok,
      title,
      artistName,
      albumName,
      note,
      url,
      imageId: imageId.ok
    });
  }
  if (duplicate(songs.map((song) => song.id))) return { error: 'Each song needs its own id.' };
  return { ok: songs };
}

function jobsFromWire(jobs: JobWire[]): Job[] {
  return jobs.map((job) => ({
    id: job.id,
    role: job.role,
    timeSpan: job.timeSpan,
    body: job.body,
    skills: splitSkills(job.skillsText),
    orgs: job.orgs
  }));
}

function emptyJob(job: Job): boolean {
  return (
    !job.role &&
    !job.timeSpan &&
    !job.body &&
    job.skills.length === 0 &&
    job.orgs.every((org) => !org.name && !org.href)
  );
}

function emptyGroup(group: TechGroup): boolean {
  return !group.title && group.items.every((item) => !item.text && !item.href);
}

function emptyArtist(entry: ArtistWire): boolean {
  return !entry.name && !entry.note && !entry.url && !entry.imageId;
}

function emptyAlbum(entry: AlbumWire): boolean {
  return !entry.title && !entry.artistName && !entry.note && !entry.url && !entry.imageId;
}

function emptySong(entry: SongWire): boolean {
  return (
    !entry.title &&
    !entry.artistName &&
    !entry.albumName &&
    !entry.note &&
    !entry.url &&
    !entry.imageId
  );
}

function knownId(
  id: string,
  ids: Set<string>,
  message: string
): { ok: string } | { error: string } {
  if (!id) return { ok: '' };
  if (!ids.has(id)) return { error: message };
  return { ok: id };
}

async function deleteMissing(
  supabase: Client,
  table:
    | 'portraits'
    | 'work_experiences'
    | 'tech_groups'
    | 'music_artists'
    | 'music_albums'
    | 'music_songs',
  ids: string[]
): Promise<string | null> {
  if (ids.length === 0) {
    const { error: deleteError } = await supabase.from(table).delete().gte('sort_order', 0);
    return deleteError?.message ?? null;
  }

  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .not('id', 'in', `(${ids.join(',')})`);
  return deleteError?.message ?? null;
}

export async function saveProfessionalFromForm(
  supabase: Client,
  form: FormData
): Promise<{ ok: true } | { error: string; content?: ProfessionalContent }> {
  await requireAdmin(supabase);

  const intro = text(form.get('intro'));
  const workIntro = text(form.get('workIntro'));
  const techIntro = text(form.get('techIntro'));
  if (intro.length > 8000 || workIntro.length > 500 || techIntro.length > 500) {
    return { error: 'One of the introductions is too long.' };
  }

  const portraitsJson = parseJson(String(form.get('portraits') ?? ''));
  if ('error' in portraitsJson) return portraitsJson;
  const jobsJson = parseJson(String(form.get('jobs') ?? ''));
  if ('error' in jobsJson) return jobsJson;
  const groupsJson = parseJson(String(form.get('groups') ?? ''));
  if ('error' in groupsJson) return groupsJson;

  const portraitsParsed = parsePortraits(portraitsJson.ok);
  if ('error' in portraitsParsed) return portraitsParsed;
  const jobsParsed = parseJobs(jobsJson.ok);
  if ('error' in jobsParsed) return jobsParsed;
  const groupsParsed = parseGroups(groupsJson.ok);
  if ('error' in groupsParsed) return groupsParsed;

  const content: ProfessionalContent = {
    intro,
    workIntro,
    techIntro,
    portraits: portraitsParsed.ok.map((portrait) => ({ ...portrait })),
    jobs: jobsFromWire(jobsParsed.ok),
    groups: groupsParsed.ok
  };

  const portraits: Portrait[] = [];
  for (const portrait of portraitsParsed.ok) {
    const file = portraitFile(form, portrait.id);
    const blank = !portrait.src && !portrait.alt && !file;
    if (blank) continue;
    let src = portrait.src;
    if (file) {
      const uploaded = await uploadBlogImage(supabase, file, 'portraits');
      if ('error' in uploaded) return { error: uploaded.error, content };
      src = uploaded.url;
    }
    const href = checkHref(src, 'A portrait image');
    if ('error' in href) return { error: href.error, content };
    if (!href.ok) return { error: 'Each portrait needs an image.', content };
    portraits.push({ id: portrait.id, src: href.ok, alt: portrait.alt });
  }

  const jobs: Job[] = [];
  for (const job of content.jobs) {
    if (emptyJob(job)) continue;
    if (!job.role) return { error: 'Each role needs a title.', content };
    if (job.skills.length > 12 || job.skills.some((skill) => skill.length > 80)) {
      return { error: 'A skills list is too long.', content };
    }
    const orgs: Org[] = [];
    for (const org of job.orgs) {
      if (!org.name && !org.href) continue;
      if (!org.name) return { error: 'Each organization needs a name.', content };
      if (org.name.length > 120) return { error: 'An organization name is too long.', content };
      const href = checkHref(org.href, 'An organization link');
      if ('error' in href) return { error: href.error, content };
      orgs.push({ name: org.name, href: href.ok });
    }
    jobs.push({ ...job, orgs });
  }

  const groups: TechGroup[] = [];
  for (const group of content.groups) {
    if (emptyGroup(group)) continue;
    if (!group.title) return { error: 'Each tech group needs a title.', content };
    const items: TechItem[] = [];
    for (const item of group.items) {
      if (!item.text && !item.href) continue;
      if (!item.text) return { error: 'Each technology needs a name.', content };
      const href = checkHref(item.href, 'A technology link');
      if ('error' in href) return { error: href.error, content };
      items.push({ text: item.text, href: href.ok });
    }
    groups.push({ ...group, items });
  }

  const savedAt = new Date().toISOString();
  const { error: profileError } = await supabase.from('about_professional').upsert({
    id: 1,
    intro,
    work_intro: workIntro,
    tech_intro: techIntro,
    updated_at: savedAt
  });
  if (profileError) return { error: profileError.message, content };

  for (const [index, portrait] of portraits.entries()) {
    const { error: upsertError } = await supabase.from('portraits').upsert({
      id: portrait.id,
      src: portrait.src,
      alt: portrait.alt,
      sort_order: index
    });
    if (upsertError) return { error: upsertError.message, content };
  }
  const portraitDelete = await deleteMissing(
    supabase,
    'portraits',
    portraits.map((portrait) => portrait.id)
  );
  if (portraitDelete) return { error: portraitDelete, content };

  for (const [index, job] of jobs.entries()) {
    const { error: upsertError } = await supabase.from('work_experiences').upsert({
      id: job.id,
      role: job.role,
      time_span: job.timeSpan,
      body: job.body,
      skills: job.skills,
      orgs: job.orgs as Json,
      sort_order: index
    });
    if (upsertError) return { error: upsertError.message, content };
  }
  const jobDelete = await deleteMissing(
    supabase,
    'work_experiences',
    jobs.map((job) => job.id)
  );
  if (jobDelete) return { error: jobDelete, content };

  for (const [index, group] of groups.entries()) {
    const { error: upsertError } = await supabase.from('tech_groups').upsert({
      id: group.id,
      title: group.title,
      items: group.items as Json,
      sort_order: index
    });
    if (upsertError) return { error: upsertError.message, content };
  }
  const groupDelete = await deleteMissing(
    supabase,
    'tech_groups',
    groups.map((group) => group.id)
  );
  if (groupDelete) return { error: groupDelete, content };

  return { ok: true };
}

function personalContent(
  intro: string,
  youtubeUrl: string,
  library: MusicLibrary
): PersonalContent {
  return { intro, youtubeUrl, library };
}

export async function savePersonalFromForm(
  supabase: Client,
  form: FormData
): Promise<{ ok: true } | { error: string; content?: PersonalContent }> {
  await requireAdmin(supabase);

  const intro = text(form.get('intro'));
  const youtubeUrl = text(form.get('youtubeUrl'));
  if (intro.length > 8000) return { error: 'The introduction is too long.' };
  const youtube = checkHref(youtubeUrl, 'The video link');
  if ('error' in youtube) return { error: youtube.error };

  const artistsJson = parseJson(String(form.get('artists') ?? ''));
  if ('error' in artistsJson) return artistsJson;
  const albumsJson = parseJson(String(form.get('albums') ?? ''));
  if ('error' in albumsJson) return albumsJson;
  const songsJson = parseJson(String(form.get('songs') ?? ''));
  if ('error' in songsJson) return songsJson;

  const artistsParsed = parseArtists(artistsJson.ok);
  if ('error' in artistsParsed) return artistsParsed;
  const albumsParsed = parseAlbums(albumsJson.ok);
  if ('error' in albumsParsed) return albumsParsed;
  const songsParsed = parseSongs(songsJson.ok);
  if ('error' in songsParsed) return songsParsed;

  const images = await loadMusicLibrary(supabase);
  const imageIds = new Set((images?.images ?? []).map((image) => image.id));
  const draft = personalContent(intro, youtube.ok, {
    images: images?.images ?? [],
    artists: artistsParsed.ok,
    albums: albumsParsed.ok,
    songs: songsParsed.ok
  });
  if (!images) return { error: 'The image library could not be read.', content: draft };

  const artists: MusicArtist[] = [];
  for (const entry of artistsParsed.ok) {
    if (emptyArtist(entry)) continue;
    if (!entry.name) return { error: 'Each artist needs a name.', content: draft };
    const url = checkHref(entry.url, 'An artist link');
    if ('error' in url) return { error: url.error, content: draft };
    const imageId = knownId(entry.imageId, imageIds, 'Choose an image from the library.');
    if ('error' in imageId) return { error: imageId.error, content: draft };
    artists.push({ ...entry, url: url.ok, imageId: imageId.ok });
  }

  const albums: MusicAlbum[] = [];
  for (const entry of albumsParsed.ok) {
    if (emptyAlbum(entry)) continue;
    if (!entry.title) return { error: 'Each album needs a title.', content: draft };
    const url = checkHref(entry.url, 'An album link');
    if ('error' in url) return { error: url.error, content: draft };
    const imageId = knownId(entry.imageId, imageIds, 'Choose an image from the library.');
    if ('error' in imageId) return { error: imageId.error, content: draft };
    albums.push({ ...entry, url: url.ok, imageId: imageId.ok });
  }

  const songs: MusicSong[] = [];
  for (const entry of songsParsed.ok) {
    if (emptySong(entry)) continue;
    if (!entry.title) return { error: 'Each song needs a title.', content: draft };
    const url = checkHref(entry.url, 'A song link');
    if ('error' in url) return { error: url.error, content: draft };
    const imageId = knownId(entry.imageId, imageIds, 'Choose an image from the library.');
    if ('error' in imageId) return { error: imageId.error, content: draft };
    songs.push({
      ...entry,
      url: url.ok,
      imageId: imageId.ok
    });
  }

  const content = personalContent(intro, youtube.ok, {
    images: images.images,
    artists,
    albums,
    songs
  });

  const { error: profileError } = await supabase.from('about_personal').upsert({
    id: 1,
    intro,
    youtube_url: youtube.ok || null,
    updated_at: new Date().toISOString()
  });
  if (profileError) return { error: profileError.message, content };

  for (const [index, entry] of artists.entries()) {
    const { error: upsertError } = await supabase.from('music_artists').upsert({
      id: entry.id,
      name: entry.name,
      note: entry.note,
      url: entry.url || null,
      image_id: entry.imageId || null,
      sort_order: index
    });
    if (upsertError) return { error: upsertError.message, content };
  }

  for (const [index, entry] of albums.entries()) {
    const { error: upsertError } = await supabase.from('music_albums').upsert({
      id: entry.id,
      title: entry.title,
      artist_name: entry.artistName,
      note: entry.note,
      url: entry.url || null,
      image_id: entry.imageId || null,
      sort_order: index
    });
    if (upsertError) return { error: upsertError.message, content };
  }

  for (const [index, entry] of songs.entries()) {
    const { error: upsertError } = await supabase.from('music_songs').upsert({
      id: entry.id,
      title: entry.title,
      artist_name: entry.artistName,
      album_name: entry.albumName,
      note: entry.note,
      url: entry.url || null,
      image_id: entry.imageId || null,
      sort_order: index
    });
    if (upsertError) return { error: upsertError.message, content };
  }

  const songDelete = await deleteMissing(
    supabase,
    'music_songs',
    songs.map((entry) => entry.id)
  );
  if (songDelete) return { error: songDelete, content };
  const albumDelete = await deleteMissing(
    supabase,
    'music_albums',
    albums.map((entry) => entry.id)
  );
  if (albumDelete) return { error: albumDelete, content };
  const artistDelete = await deleteMissing(
    supabase,
    'music_artists',
    artists.map((entry) => entry.id)
  );
  if (artistDelete) return { error: artistDelete, content };

  return { ok: true };
}

export async function uploadMusicImage(
  supabase: Client,
  file: File,
  altText: string
): Promise<{ image: MusicImage } | { error: string }> {
  await requireAdmin(supabase);

  if (!COVER_TYPES.has(file.type)) return { error: 'Use a JPEG, PNG, or WebP.' };
  if (file.size === 0) return { error: 'Choose an image.' };
  if (file.size > MAX_COVER_BYTES) return { error: 'Image must be 2 MB or smaller.' };

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'webp';
  const path = `${crypto.randomUUID()}.${extension}`;
  const alt = text(altText).slice(0, 160) || 'Album cover';
  const { error: uploadError } = await supabase.storage.from(ALBUMS_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '86400',
    upsert: false
  });
  if (uploadError) return { error: uploadError.message };

  const { data, error: insertError } = await supabase
    .from('music_images')
    .insert({ path, alt })
    .select('id, alt')
    .single();
  if (insertError || !data) {
    await supabase.storage.from(ALBUMS_BUCKET).remove([path]);
    return { error: insertError?.message ?? 'Could not save that image.' };
  }

  return { image: { id: data.id, url: musicImageUrl(supabase, path), alt: data.alt } };
}

export async function deleteMusicImage(
  supabase: Client,
  id: string
): Promise<{ ok: true } | { error: string }> {
  await requireAdmin(supabase);
  const checked = checkId(id);
  if ('error' in checked) return { error: 'That image could not be found.' };

  const [artists, albums, songs] = await Promise.all([
    supabase.from('music_artists').select('id').eq('image_id', checked.ok).limit(1),
    supabase.from('music_albums').select('id').eq('image_id', checked.ok).limit(1),
    supabase.from('music_songs').select('id').eq('image_id', checked.ok).limit(1)
  ]);
  if (artists.error || albums.error || songs.error) {
    return { error: 'Could not check where that image is used.' };
  }
  if (
    (artists.data?.length ?? 0) > 0 ||
    (albums.data?.length ?? 0) > 0 ||
    (songs.data?.length ?? 0) > 0
  ) {
    return { error: 'That image is still used by a saved entry.' };
  }

  const { data: row, error: readError } = await supabase
    .from('music_images')
    .select('path')
    .eq('id', checked.ok)
    .maybeSingle();
  if (readError) return { error: readError.message };
  if (!row) return { error: 'That image is already gone.' };

  const { error: deleteError } = await supabase.from('music_images').delete().eq('id', checked.ok);
  if (deleteError) return { error: deleteError.message };

  const { error: storageError } = await supabase.storage.from(ALBUMS_BUCKET).remove([row.path]);
  if (storageError) console.error('Failed to remove album image', storageError);
  return { ok: true };
}
