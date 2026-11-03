import type { SupabaseClient } from '@supabase/supabase-js';
import { photos } from '#lib/backdrop.svelte.ts';
import { ALBUMS_BUCKET, PORTRAITS_BUCKET, musicImageUrl } from '#lib/about.ts';
import type { Database } from '#lib/database.types.ts';
import { RESUME_BUCKET } from '#lib/resume.ts';
import {
	UPLOAD_TARGETS,
	type StorageItem,
	type StorageKind,
	type StorageReference,
	type UploadTarget
} from '#lib/observability-types.ts';
import {
	uploadBlogImage,
	uploadPortraitImage,
	type ImageFolder
} from '#lib/server/admin-posts.ts';
import { uploadMusicImage, deleteMusicImage } from '#lib/server/admin-about.ts';
import { uploadResume } from '#lib/server/admin-resume.ts';
import { bustCache } from '#lib/server/observability/cache.ts';

export { UPLOAD_TARGETS };
export type { StorageItem, StorageKind, StorageReference, UploadTarget };

type Client = SupabaseClient<Database>;

const BLOG_BUCKET = 'blog-images';
const MARKDOWN_IMAGE = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const BARE_URL = /https?:\/\/[^\s)"']+/g;

function normalizeUrl(url: string) {
	try {
		const parsed = new URL(url);
		parsed.hash = '';
		parsed.search = '';
		return parsed.toString().replace(/\/$/, '');
	} catch {
		return url.split('?')[0]?.replace(/\/$/, '') ?? url;
	}
}

function addRef(
	map: Map<string, StorageReference[]>,
	key: string,
	ref: StorageReference
) {
	const normalized = normalizeUrl(key);
	const list = map.get(normalized) ?? [];
	list.push(ref);
	map.set(normalized, list);
	// Also index by bare path tail for storage paths
	const pathMatch = normalized.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
	if (pathMatch?.[1]) {
		const pathKey = pathMatch[1];
		const pathList = map.get(pathKey) ?? [];
		pathList.push(ref);
		map.set(pathKey, pathList);
	}
}

function collectMarkdownUrls(body: string) {
	const urls = new Set<string>();
	for (const match of body.matchAll(MARKDOWN_IMAGE)) {
		if (match[1]) urls.add(match[1]);
	}
	for (const match of body.matchAll(BARE_URL)) {
		if (match[0].includes('/storage/') || match[0].includes('blog-images')) {
			urls.add(match[0]);
		}
	}
	return urls;
}

async function buildReferenceIndex(supabase: Client) {
	const refs = new Map<string, StorageReference[]>();

	const [posts, projects, portraits, musicImages, artists, albums, songs, resume] =
		await Promise.all([
			supabase.from('posts').select('slug, title, image, body'),
			supabase.from('projects').select('slug, title, image, images'),
			supabase.from('portraits').select('id, alt, src, kind'),
			supabase.from('music_images').select('id, path, alt'),
			supabase.from('music_artists').select('id, name, image_id'),
			supabase.from('music_albums').select('id, title, image_id'),
			supabase.from('music_songs').select('id, title, image_id'),
			supabase.from('resume').select('path, filename').eq('id', 1).maybeSingle()
		]);

	for (const post of posts.data ?? []) {
		if (post.image) {
			addRef(refs, post.image, {
				kind: 'cover',
				label: `Post cover: ${post.title}`,
				detail: `/admin/blog/${post.slug}`
			});
		}
		for (const url of collectMarkdownUrls(post.body ?? '')) {
			addRef(refs, url, {
				kind: 'inline',
				label: `Post body: ${post.title}`,
				detail: `/admin/blog/${post.slug}`
			});
		}
	}

	for (const project of projects.data ?? []) {
		if (project.image) {
			addRef(refs, project.image, {
				kind: 'cover',
				label: `Project cover: ${project.title}`,
				detail: `/admin/projects/${project.slug}`
			});
		}
		for (const url of project.images ?? []) {
			addRef(refs, url, {
				kind: 'gallery',
				label: `Project gallery: ${project.title}`,
				detail: `/admin/projects/${project.slug}`
			});
		}
	}

	for (const portrait of portraits.data ?? []) {
		const personal = portrait.kind === 'personal';
		addRef(refs, portrait.src, {
			kind: 'portrait',
			label: `${personal ? 'Personal' : 'Professional'} portrait: ${portrait.alt || portrait.id}`,
			detail: personal
				? '/admin/about/personal/portraits'
				: '/admin/about/professional/portraits'
		});
	}

	const musicById = new Map((musicImages.data ?? []).map((row) => [row.id, row]));
	for (const row of musicImages.data ?? []) {
		const url = musicImageUrl(supabase, row.path);
		addRef(refs, url, {
			kind: 'music',
			label: `Music asset: ${row.alt}`,
			detail: row.path
		});
		addRef(refs, row.path, {
			kind: 'music',
			label: `Music asset: ${row.alt}`,
			detail: row.path
		});
	}

	const attachMusic = (
		imageId: string | null,
		kind: string,
		label: string
	) => {
		if (!imageId) return;
		const row = musicById.get(imageId);
		if (!row) return;
		const url = musicImageUrl(supabase, row.path);
		addRef(refs, url, { kind, label, detail: '/admin/about/personal' });
		addRef(refs, row.path, { kind, label, detail: '/admin/about/personal' });
	};

	for (const artist of artists.data ?? []) {
		attachMusic(artist.image_id, 'music-artist', `Artist: ${artist.name}`);
	}
	for (const album of albums.data ?? []) {
		attachMusic(album.image_id, 'music-album', `Album: ${album.title}`);
	}
	for (const song of songs.data ?? []) {
		attachMusic(song.image_id, 'music-song', `Song: ${song.title}`);
	}

	if (resume.data?.path) {
		const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(resume.data.path);
		addRef(refs, data.publicUrl, {
			kind: 'resume',
			label: `Resume: ${resume.data.filename}`,
			detail: '/admin/resume'
		});
		addRef(refs, resume.data.path, {
			kind: 'resume',
			label: `Resume: ${resume.data.filename}`,
			detail: '/admin/resume'
		});
	}

	for (const src of photos) {
		addRef(refs, src, {
			kind: 'background',
			label: 'Site backdrop (hardcoded)',
			detail: 'src/lib/backdrop.svelte.ts'
		});
	}

	return { refs, musicByPath: new Map((musicImages.data ?? []).map((row) => [row.path, row.id])) };
}

function refsFor(
	index: Map<string, StorageReference[]>,
	url: string,
	path: string
): StorageReference[] {
	const merged = [
		...(index.get(normalizeUrl(url)) ?? []),
		...(index.get(path) ?? []),
		...(index.get(normalizeUrl(path)) ?? [])
	];
	const seen = new Set<string>();
	return merged.filter((ref) => {
		const key = `${ref.kind}:${ref.label}:${ref.detail ?? ''}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

async function listBucketFolder(
	supabase: Client,
	bucket: string,
	folder: string
): Promise<
	{
		name: string;
		path: string;
		bytes: number | null;
		createdAt: string | null;
		url: string;
	}[]
> {
	const { data, error } = await supabase.storage.from(bucket).list(folder || undefined, {
		limit: 1000,
		sortBy: { column: 'created_at', order: 'desc' }
	});
	if (error || !data) {
		if (error) console.error(`Failed to list ${bucket}/${folder}`, error);
		return [];
	}

	const out: {
		name: string;
		path: string;
		bytes: number | null;
		createdAt: string | null;
		url: string;
	}[] = [];

	for (const entry of data) {
		if (!entry.name || entry.name.startsWith('.')) continue;
		const isFolder = !entry.id;
		if (isFolder) {
			const nested = await listBucketFolder(
				supabase,
				bucket,
				folder ? `${folder}/${entry.name}` : entry.name
			);
			out.push(...nested);
			continue;
		}
		const path = folder ? `${folder}/${entry.name}` : entry.name;
		const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
		const size = (entry.metadata as { size?: number } | null)?.size;
		out.push({
			name: entry.name,
			path,
			bytes: typeof size === 'number' ? size : null,
			createdAt: entry.created_at ?? null,
			url: pub.publicUrl
		});
	}
	return out;
}

export async function loadStorageInventory(supabase: Client): Promise<{
	items: StorageItem[];
	error: string | null;
}> {
	const { refs, musicByPath } = await buildReferenceIndex(supabase);

	const [covers, inline, legacyPortraits, proPortraits, personalPortraits, albums, resumes] =
		await Promise.all([
			listBucketFolder(supabase, BLOG_BUCKET, 'covers'),
			listBucketFolder(supabase, BLOG_BUCKET, 'inline'),
			listBucketFolder(supabase, BLOG_BUCKET, 'portraits'),
			listBucketFolder(supabase, PORTRAITS_BUCKET, 'professional'),
			listBucketFolder(supabase, PORTRAITS_BUCKET, 'personal'),
			listBucketFolder(supabase, ALBUMS_BUCKET, ''),
			listBucketFolder(supabase, RESUME_BUCKET, '')
		]);

	const items: StorageItem[] = [];

	const pushFiles = (
		bucket: string,
		kind: StorageKind,
		files: Awaited<ReturnType<typeof listBucketFolder>>
	) => {
		for (const file of files) {
			const references = refsFor(refs, file.url, file.path);
			items.push({
				id: `${bucket}:${file.path}`,
				kind,
				bucket,
				path: file.path,
				name: file.name,
				url: file.url,
				bytes: file.bytes,
				createdAt: file.createdAt,
				musicImageId: null,
				deletable: references.length === 0,
				references,
				readonlyReason: references.length
					? 'Remove every reference on the site before deleting.'
					: null
			});
		}
	};

	pushFiles(BLOG_BUCKET, 'blog-covers', covers);
	pushFiles(BLOG_BUCKET, 'blog-inline', inline);
	pushFiles(BLOG_BUCKET, 'blog-portraits', legacyPortraits);
	pushFiles(PORTRAITS_BUCKET, 'about-portraits-professional', proPortraits);
	pushFiles(PORTRAITS_BUCKET, 'about-portraits-personal', personalPortraits);

	for (const file of albums) {
		const musicImageId = musicByPath.get(file.path) ?? null;
		// Drop the inventory self-tag; only real site usage blocks delete.
		const references = refsFor(refs, file.url, file.path).filter((ref) => ref.kind !== 'music');
		items.push({
			id: `${ALBUMS_BUCKET}:${file.path}`,
			kind: 'music',
			bucket: ALBUMS_BUCKET,
			path: file.path,
			name: file.name,
			url: file.url,
			bytes: file.bytes,
			createdAt: file.createdAt,
			musicImageId,
			deletable: references.length === 0,
			references,
			readonlyReason: references.length
				? 'Unlink this image from artists, albums, and songs first.'
				: null
		});
	}

	for (const file of resumes) {
		const references = refsFor(refs, file.url, file.path);
		items.push({
			id: `${RESUME_BUCKET}:${file.path}`,
			kind: 'resume',
			bucket: RESUME_BUCKET,
			path: file.path,
			name: file.name,
			url: file.url,
			bytes: file.bytes,
			createdAt: file.createdAt,
			musicImageId: null,
			deletable: false,
			references,
			readonlyReason: 'Replace the resume from Resume admin instead of deleting the live PDF.'
		});
	}

	for (const src of photos) {
		const name = src.split('/').pop() ?? src;
		items.push({
			id: `background:${src}`,
			kind: 'background',
			bucket: null,
			path: src,
			name,
			url: src,
			bytes: null,
			createdAt: null,
			musicImageId: null,
			deletable: false,
			references: [
				{
					kind: 'background',
					label: 'Hardcoded site backdrop',
					detail: 'src/lib/backdrop.svelte.ts'
				}
			],
			readonlyReason: 'Backgrounds are hardcoded in the codebase and cannot be deleted here.'
		});
	}

	items.sort((a, b) => {
		const unused = Number(a.references.length === 0) - Number(b.references.length === 0);
		if (unused !== 0) return -unused;
		return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
	});

	return { items, error: null };
}

export async function uploadStorageAsset(
	supabase: Client,
	form: FormData
): Promise<{ ok: true; message: string } | { error: string }> {
	const target = String(form.get('target') ?? '') as UploadTarget;
	const file = form.get('file');
	if (!(file instanceof File) || file.size === 0) {
		return { error: 'Choose a file to upload.' };
	}

	if (target === 'blog-covers' || target === 'blog-inline') {
		const folder: ImageFolder = target === 'blog-covers' ? 'covers' : 'inline';
		const result = await uploadBlogImage(supabase, file, folder);
		if ('error' in result) return result;
		bustCache('supabase-usage');
		return { ok: true, message: `Uploaded to blog-images/${folder}.` };
	}

	if (target === 'about-portraits-professional' || target === 'about-portraits-personal') {
		const kind = target === 'about-portraits-professional' ? 'professional' : 'personal';
		const result = await uploadPortraitImage(supabase, file, kind);
		if ('error' in result) return result;
		bustCache('supabase-usage');
		return { ok: true, message: `Uploaded to portraits/${kind}.` };
	}

	if (target === 'music') {
		const alt = String(form.get('alt') ?? '').trim() || 'Album cover';
		const result = await uploadMusicImage(supabase, file, alt);
		if ('error' in result) return result;
		bustCache('supabase-usage');
		return { ok: true, message: 'Uploaded to the albums bucket.' };
	}

	if (target === 'resume') {
		const result = await uploadResume(supabase, file, file.name);
		if ('error' in result) return result;
		bustCache('supabase-usage');
		return { ok: true, message: 'Resume PDF replaced.' };
	}

	return { error: 'Choose a valid upload destination.' };
}

export async function deleteStorageAsset(
	supabase: Client,
	form: FormData
): Promise<{ ok: true; message: string } | { error: string }> {
	const id = String(form.get('id') ?? '');
	const confirmed = String(form.get('confirm') ?? '') === 'yes';
	if (!confirmed) return { error: 'Confirm deletion first.' };

	const { items } = await loadStorageInventory(supabase);
	const item = items.find((entry) => entry.id === id);
	if (!item) return { error: 'That file was not found.' };
	if (item.kind === 'background') {
		return { error: 'Backgrounds are hardcoded and cannot be deleted here.' };
	}
	if (!item.deletable || item.references.length > 0) {
		return {
			error: `Still referenced (${item.references.map((ref) => ref.label).join('; ')}). Remove those references first.`
		};
	}
	if (!item.bucket) return { error: 'That file cannot be deleted.' };

	if (item.kind === 'music') {
		if (item.musicImageId) {
			const result = await deleteMusicImage(supabase, item.musicImageId);
			if ('error' in result) return result;
		} else {
			const { error } = await supabase.storage.from(item.bucket).remove([item.path]);
			if (error) return { error: error.message };
		}
		bustCache('supabase-usage');
		return { ok: true, message: 'Deleted unused music image.' };
	}

	if (item.kind === 'resume') {
		return { error: 'Resume files cannot be deleted from Storage; replace them on the Resume page.' };
	}

	const { error } = await supabase.storage.from(item.bucket).remove([item.path]);
	if (error) return { error: error.message };
	bustCache('supabase-usage');
	return { ok: true, message: 'Deleted unused file.' };
}
