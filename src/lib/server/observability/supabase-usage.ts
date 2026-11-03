import { SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF } from '$app/env/private';
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
	return Boolean(SUPABASE_ACCESS_TOKEN && SUPABASE_PROJECT_REF);
}

async function managementGet(path: string, query: Record<string, string> = {}) {
	const params = new URLSearchParams(query);
	const url = `${MGMT}${path}${params.size ? `?${params}` : ''}`;
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
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

async function managementQuery(sql: string) {
	const response = await fetch(`${MGMT}/projects/${SUPABASE_PROJECT_REF}/database/query`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({ query: sql })
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
				: `Database query failed (${response.status})`;
		throw new Error(message);
	}
	return body;
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
		'Bucket sizes come from Storage listings (free). Disk / DB size / API counts need a free Supabase personal access token — no paid add-on.';

	return cached('supabase-usage:v1', TTL, async () => {
		const bucketsWanted = [BLOG_BUCKET, PORTRAITS_BUCKET, ALBUMS_BUCKET, RESUME_BUCKET];
		const [blog, aboutPortraits, albums, resumes, posts, projects, portraits, musicImages] =
			await Promise.all([
				listFolderBytes(supabase, BLOG_BUCKET),
				listFolderBytes(supabase, PORTRAITS_BUCKET),
				listFolderBytes(supabase, ALBUMS_BUCKET),
				listFolderBytes(supabase, RESUME_BUCKET),
				countTable(supabase, 'posts'),
				countTable(supabase, 'projects'),
				countTable(supabase, 'portraits'),
				countTable(supabase, 'music_images')
			]);

		const buckets: BucketSize[] = [
			{ bucket: BLOG_BUCKET, ...blog },
			{ bucket: PORTRAITS_BUCKET, ...aboutPortraits },
			{ bucket: ALBUMS_BUCKET, ...albums },
			{ bucket: RESUME_BUCKET, ...resumes }
		];

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
					'Storage + row counts loaded. Set SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF for disk, database size, and API request charts.',
				disk: null,
				databaseBytes: null,
				buckets,
				apiCounts: [],
				tableCounts,
				note
			};
		}

		try {
			const [diskRes, dbRes, apiRes] = await Promise.all([
				managementGet(`/projects/${SUPABASE_PROJECT_REF}/config/disk/util`).then(
					(data) => ({ data, error: null as string | null }),
					(err) => ({ data: null, error: err instanceof Error ? err.message : String(err) })
				),
				managementQuery('select pg_database_size(current_database()) as bytes;').then(
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

			const problems = [diskRes.error, dbRes.error, apiRes.error].filter(Boolean) as string[];
			const diskRaw = diskRes.data;
			const dbRaw = dbRes.data;
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

			let databaseBytes: number | null = null;
			if (Array.isArray(dbRaw) && dbRaw[0] && typeof dbRaw[0] === 'object') {
				databaseBytes = Number((dbRaw[0] as { bytes?: number }).bytes ?? 0);
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

			// Prefer exact storage.objects sizes when the Management SQL works
			try {
				const exact = await managementQuery(`
					select bucket_id as bucket,
					  coalesce(sum((metadata->>'size')::bigint), 0) as bytes,
					  count(*)::int as objects
					from storage.objects
					where bucket_id in ('${bucketsWanted.join("','")}')
					group by bucket_id
					order by bytes desc;
				`);
				if (Array.isArray(exact)) {
					const byName = new Map(
						exact.map((row) => {
							const r = row as { bucket: string; bytes: number; objects: number };
							return [r.bucket, { bucket: r.bucket, bytes: Number(r.bytes), objects: Number(r.objects) }];
						})
					);
					for (let i = 0; i < buckets.length; i++) {
						const hit = byName.get(buckets[i].bucket);
						if (hit) buckets[i] = hit;
					}
				}
			} catch {
				// Keep listing-based sizes
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
				databaseBytes: null,
				buckets,
				apiCounts: [],
				tableCounts,
				note
			};
		}
	});
}

