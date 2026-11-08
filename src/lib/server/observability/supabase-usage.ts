import { SUPABASE_USAGE_TOKEN, SUPABASE_PROJECT_REF } from '$app/env/private';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';
import { ALBUMS_BUCKET, PORTRAITS_BUCKET } from '#lib/about.ts';
import { RESUME_BUCKET } from '#lib/resume.ts';
import { cached } from '#lib/server/observability/cache.ts';

type Client = SupabaseClient<Database>;

const TTL = 60_000;
const MGMT = 'https://api.supabase.com/v1';
const BLOG_BUCKET = 'blog-images';

export type BucketSize = { bucket: string; bytes: number; objects: number };
export type ApiCountPoint = {
  timestamp: string;
  rest: number;
  storage: number;
  auth: number;
  realtime: number;
};

export type SupabaseUsageReport = {
  configured: boolean;
  error: string | null;
  disk: { usedBytes: number; sizeBytes: number; availBytes: number } | null;
  databaseBytes: number | null;
  buckets: BucketSize[];
  apiCounts: ApiCountPoint[];
  tableCounts: { table: string; count: number }[];
  note: string;
};

function configured() {
  return Boolean(SUPABASE_USAGE_TOKEN && SUPABASE_PROJECT_REF);
}

async function managementGet(path: string, query: Record<string, string> = {}) {
  const params = new URLSearchParams(query);
  const url = `${MGMT}${path}${params.size ? `?${params}` : ''}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SUPABASE_USAGE_TOKEN}`,
      Accept: 'application/json'
    }
  });
  const text = await response.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { message: text };
  }
  if (!response.ok) {
    const message =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Supabase Management API ${response.status}`;
    throw new Error(message);
  }
  return body;
}

/**
 * Database size + exact per-bucket totals via the admin-only `admin_storage_usage` RPC, called
 * with the admin's own session. Replaces raw SQL through the Management API, which needed a
 * database-capable access token. Returns null if the RPC fails (listing sizes are kept).
 */
async function loadStorageStats(supabase: Client, bucketIds: string[]) {
  const { data, error } = await supabase.rpc('admin_storage_usage', { bucket_ids: bucketIds });
  if (error || !data || typeof data !== 'object' || Array.isArray(data)) return null;
  const raw = data as { database_bytes?: unknown; buckets?: unknown };
  const buckets = Array.isArray(raw.buckets)
    ? raw.buckets.map((row) => {
        const r = row as { bucket: string; bytes: number; objects: number };
        return { bucket: String(r.bucket), bytes: Number(r.bytes), objects: Number(r.objects) };
      })
    : [];
  return { databaseBytes: Number(raw.database_bytes ?? 0), buckets };
}

async function listFolderBytes(
  supabase: Client,
  bucket: string,
  folder = ''
): Promise<{ bytes: number; objects: number }> {
  const { data, error } = await supabase.storage.from(bucket).list(folder || undefined, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' }
  });
  if (error || !data) return { bytes: 0, objects: 0 };

  let bytes = 0;
  let objects = 0;
  for (const entry of data) {
    if (!entry.name || entry.name.startsWith('.')) continue;
    const isFolder = !entry.id;
    if (isFolder) {
      const nested = await listFolderBytes(
        supabase,
        bucket,
        folder ? `${folder}/${entry.name}` : entry.name
      );
      bytes += nested.bytes;
      objects += nested.objects;
      continue;
    }
    objects += 1;
    const size = (entry.metadata as { size?: number } | null)?.size;
    if (typeof size === 'number') bytes += size;
  }
  return { bytes, objects };
}

async function countTable(supabase: Client, table: keyof Database['public']['Tables']) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count ?? 0;
}

export async function loadSupabaseUsage(supabase: Client): Promise<SupabaseUsageReport> {
  const note =
    'Bucket and database sizes come from an admin-only database function. Disk and API counts need a Supabase access token scoped to Usage Analytics: Read and Disk Config: Read.';

  return cached('supabase-usage:v2', TTL, async () => {
    const bucketsWanted = [BLOG_BUCKET, PORTRAITS_BUCKET, ALBUMS_BUCKET, RESUME_BUCKET];
    const [blog, aboutPortraits, albums, resumes, posts, projects, portraits, musicImages, stats] =
      await Promise.all([
        listFolderBytes(supabase, BLOG_BUCKET),
        listFolderBytes(supabase, PORTRAITS_BUCKET),
        listFolderBytes(supabase, ALBUMS_BUCKET),
        listFolderBytes(supabase, RESUME_BUCKET),
        countTable(supabase, 'posts'),
        countTable(supabase, 'projects'),
        countTable(supabase, 'portraits'),
        countTable(supabase, 'music_images'),
        loadStorageStats(supabase, bucketsWanted)
      ]);

    const buckets: BucketSize[] = [
      { bucket: BLOG_BUCKET, ...blog },
      { bucket: PORTRAITS_BUCKET, ...aboutPortraits },
      { bucket: ALBUMS_BUCKET, ...albums },
      { bucket: RESUME_BUCKET, ...resumes }
    ];

    // Prefer exact storage.objects totals from the RPC over listing-based sizes.
    const databaseBytes = stats?.databaseBytes ?? null;
    if (stats) {
      const byName = new Map(stats.buckets.map((row) => [row.bucket, row]));
      for (let i = 0; i < buckets.length; i++) {
        buckets[i] = byName.get(buckets[i].bucket) ?? { ...buckets[i], bytes: 0, objects: 0 };
      }
    }

    const tableCounts = [
      { table: 'posts', count: posts },
      { table: 'projects', count: projects },
      { table: 'portraits', count: portraits },
      { table: 'music_images', count: musicImages }
    ];

    if (!configured()) {
      return {
        configured: false,
        error:
          'Storage, database size and row counts loaded. Set SUPABASE_USAGE_TOKEN and SUPABASE_PROJECT_REF for disk and API request charts.',
        disk: null,
        databaseBytes,
        buckets,
        apiCounts: [],
        tableCounts,
        note
      };
    }

    try {
      const [diskRes, apiRes] = await Promise.all([
        managementGet(`/projects/${SUPABASE_PROJECT_REF}/config/disk/util`).then(
          (data) => ({ data, error: null as string | null }),
          (err) => ({ data: null, error: err instanceof Error ? err.message : String(err) })
        ),
        managementGet(`/projects/${SUPABASE_PROJECT_REF}/analytics/endpoints/usage.api-counts`, {
          interval: '1day'
        }).then(
          (data) => ({ data, error: null as string | null }),
          (err) => ({ data: null, error: err instanceof Error ? err.message : String(err) })
        )
      ]);

      const problems = [diskRes.error, apiRes.error].filter(Boolean) as string[];
      const diskRaw = diskRes.data;
      const apiRaw = apiRes.data;

      let disk: SupabaseUsageReport['disk'] = null;
      if (diskRaw && typeof diskRaw === 'object' && 'metrics' in diskRaw) {
        const metrics = (diskRaw as { metrics: Record<string, number> }).metrics;
        disk = {
          usedBytes: Number(metrics.fs_used_bytes ?? 0),
          sizeBytes: Number(metrics.fs_size_bytes ?? 0),
          availBytes: Number(metrics.fs_avail_bytes ?? 0)
        };
      }

      const apiCounts: ApiCountPoint[] = [];
      if (apiRaw && typeof apiRaw === 'object' && 'result' in apiRaw) {
        const rows = (apiRaw as { result?: Record<string, unknown>[] }).result ?? [];
        for (const row of rows) {
          apiCounts.push({
            timestamp: String(row.timestamp ?? ''),
            rest: Number(row.total_rest_requests ?? 0),
            storage: Number(row.total_storage_requests ?? 0),
            auth: Number(row.total_auth_requests ?? 0),
            realtime: Number(row.total_realtime_requests ?? 0)
          });
        }
      }

      return {
        configured: true,
        error: problems.length ? problems.join(' · ') : null,
        disk,
        databaseBytes,
        buckets,
        apiCounts,
        tableCounts,
        note
      };
    } catch (err) {
      return {
        configured: true,
        error: err instanceof Error ? err.message : 'Failed to load Supabase usage',
        disk: null,
        databaseBytes,
        buckets,
        apiCounts: [],
        tableCounts,
        note
      };
    }
  });
}
