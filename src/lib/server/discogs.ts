import {
  DISCOGS_CONSUMER_KEY,
  DISCOGS_CONSUMER_SECRET,
  DISCOGS_USER_TOKEN
} from '$app/env/private';
import { url as siteUrl } from '#lib/config.ts';
import type { MusicCatalogHit, MusicCatalogKind } from '#lib/music-catalog-types.ts';

export type { MusicCatalogHit, MusicCatalogKind };

const API = 'https://api.discogs.com';
const USER_AGENT = `joshuafouch-website/1.0 +${siteUrl}`;

let nextAllowedAt = 0;
let queue: Promise<void> = Promise.resolve();

export function discogsConfigured(): boolean {
  if (DISCOGS_USER_TOKEN.trim()) return true;
  return Boolean(DISCOGS_CONSUMER_KEY.trim() && DISCOGS_CONSUMER_SECRET.trim());
}

function authHeader(): string {
  const token = DISCOGS_USER_TOKEN.trim();
  if (token) return `Discogs token=${token}`;
  return `Discogs key=${DISCOGS_CONSUMER_KEY.trim()}, secret=${DISCOGS_CONSUMER_SECRET.trim()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function httpsUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:') parsed.protocol = 'https:';
    if (parsed.protocol !== 'https:') return '';
    return parsed.href;
  } catch {
    return '';
  }
}

function splitTitle(title: string): { artistName: string; name: string } {
  const parts = title.split(' - ');
  if (parts.length < 2) return { artistName: '', name: title.trim() };
  const artistName = parts[0]?.trim() ?? '';
  const name = parts.slice(1).join(' - ').trim();
  return { artistName, name: name || title.trim() };
}

function discogsType(kind: MusicCatalogKind): 'artist' | 'master' | 'release' {
  if (kind === 'artist') return 'artist';
  if (kind === 'album') return 'master';
  return 'release';
}

function asHit(item: Record<string, unknown>, kind: MusicCatalogKind): MusicCatalogHit | null {
  const id = item.id == null ? '' : String(item.id);
  if (!id || !/^\d+$/.test(id)) return null;

  const uri = typeof item.uri === 'string' ? item.uri.trim() : '';
  const deep = uri.startsWith('/')
    ? `https://www.discogs.com${uri}`
    : httpsUrl(uri) ||
      (kind === 'artist'
        ? `https://www.discogs.com/artist/${id}`
        : kind === 'album'
          ? `https://www.discogs.com/master/${id}`
          : `https://www.discogs.com/release/${id}`);

  const rawTitle = typeof item.title === 'string' ? item.title.trim() : '';
  if (!rawTitle) return null;

  let imageUrl = httpsUrl(item.cover_image) || httpsUrl(item.thumb);
  if (!imageUrl && Array.isArray(item.images)) {
    const primary = item.images.find((image) => isRecord(image) && image.type === 'primary');
    const first = item.images.find((image) => isRecord(image));
    const chosen = isRecord(primary) ? primary : isRecord(first) ? first : null;
    imageUrl = chosen ? httpsUrl(chosen.uri) : '';
  }

  if (kind === 'artist') {
    return {
      id,
      name: rawTitle,
      artistName: '',
      albumName: '',
      url: deep,
      imageUrl
    };
  }

  const { artistName, name } = splitTitle(rawTitle);
  // Song search uses Discogs releases for cover art; keep the release title as albumName
  // and leave name empty so callers can preserve the song title from the query.
  if (kind === 'track') {
    return {
      id,
      name: '',
      artistName,
      albumName: name,
      url: deep,
      imageUrl
    };
  }
  return {
    id,
    name,
    artistName,
    albumName: '',
    url: deep,
    imageUrl
  };
}

async function throttle<T>(run: () => Promise<T>): Promise<T> {
  const job = queue.then(async () => {
    const wait = Math.max(0, nextAllowedAt - Date.now());
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    try {
      return await run();
    } finally {
      nextAllowedAt = Date.now() + 1100;
    }
  });
  queue = job.then(
    () => undefined,
    () => undefined
  );
  return job;
}

async function discogsGet(path: string, query: Record<string, string>): Promise<unknown> {
  if (!discogsConfigured()) {
    throw new Error(
      'Set DISCOGS_USER_TOKEN (or DISCOGS_CONSUMER_KEY and DISCOGS_CONSUMER_SECRET) to search Discogs.'
    );
  }

  return throttle(async () => {
    const params = new URLSearchParams(query);
    const response = await fetch(`${API}${path}?${params}`, {
      headers: {
        Authorization: authHeader(),
        'User-Agent': USER_AGENT,
        Accept: 'application/vnd.discogs.v2.discogs+json'
      }
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('Discogs request failed', response.status, detail);
      if (response.status === 401 || response.status === 403) {
        throw new Error('Discogs rejected the credentials. Check the token or key/secret.');
      }
      if (response.status === 429) {
        throw new Error('Discogs rate limit hit. Wait a moment and try again.');
      }
      throw new Error('Discogs search failed. Try again.');
    }
    return response.json();
  });
}

export async function searchDiscogs(
  kind: MusicCatalogKind,
  query: string,
  limit = 8
): Promise<MusicCatalogHit[]> {
  const q = query.trim();
  if (!q) return [];
  const capped = Math.min(Math.max(limit, 1), 12);
  const type = discogsType(kind);
  const json = await discogsGet('/database/search', {
    q,
    type,
    per_page: String(capped),
    page: '1'
  });
  if (!isRecord(json) || !Array.isArray(json.results)) return [];

  let hits = json.results.flatMap((item) => {
    if (!isRecord(item)) return [];
    const hit = asHit(item, kind);
    return hit ? [hit] : [];
  });

  // Masters are preferred for albums; if empty, fall back to releases.
  if (kind === 'album' && hits.length === 0) {
    const fallback = await discogsGet('/database/search', {
      q,
      type: 'release',
      per_page: String(capped),
      page: '1'
    });
    if (isRecord(fallback) && Array.isArray(fallback.results)) {
      hits = fallback.results.flatMap((item) => {
        if (!isRecord(item)) return [];
        const hit = asHit(item, kind);
        return hit ? [hit] : [];
      });
    }
  }

  if (kind === 'track') {
    hits = hits.map((hit) => ({ ...hit, name: hit.name || q }));
  }

  return hits;
}

export async function searchDiscogsBest(
  kind: MusicCatalogKind,
  query: string
): Promise<MusicCatalogHit | null> {
  const hits = await searchDiscogs(kind, query, 1);
  return hits[0] ?? null;
}
