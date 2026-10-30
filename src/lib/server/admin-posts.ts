import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdminEmail } from '#lib/admin.ts';
import type { Database } from '#lib/database.types.ts';
import { slugify } from '#lib/slug.ts';
import type { BlogImage } from '#lib/types.ts';

type Client = SupabaseClient<Database>;

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type AdminPost = Database['public']['Tables']['posts']['Row'];

export async function requireAdmin(supabase: Client) {
  const { data, error: authError } = await supabase.auth.getClaims();
  const email =
    !authError && data?.claims && typeof data.claims.email === 'string' ? data.claims.email : null;

  if (!isAdminEmail(email)) {
    error(401, 'Unauthorized');
  }
}

export async function getAdminPosts(supabase: Client) {
  const { data, error: dbError } = await supabase
    .from('posts')
    .select('id, title, slug, date, published, image')
    .order('date', { ascending: false });

  if (dbError) {
    console.error('Failed to list admin posts', dbError);
    error(500, 'Failed to load posts');
  }

  return data ?? [];
}

export async function getAdminPostBySlug(supabase: Client, slug: string) {
  const { data, error: dbError } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (dbError) {
    console.error('Failed to load admin post', dbError);
    error(500, 'Failed to load post');
  }

  return data;
}

export type ImageFolder = 'covers' | 'inline' | 'portraits';

export async function uploadBlogImage(
  supabase: Client,
  file: File,
  folder: ImageFolder
): Promise<{ url: string } | { error: string }> {
  if (!IMAGE_TYPES.has(file.type)) {
    return { error: 'Use a JPEG, PNG, WebP, or GIF.' };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { error: 'Image must be 5 MB or smaller.' };
  }

  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, '') || 'img';
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from('blog-images').upload(path, file, {
    contentType: file.type,
    upsert: false
  });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
  return { url: data.publicUrl };
}

const LIBRARY_FOLDERS = ['covers', 'inline'] as const;

export async function listBlogImages(
  supabase: Client,
  folders: readonly ImageFolder[] = LIBRARY_FOLDERS
): Promise<{ images: BlogImage[]; imageError: string | null }> {
  const listed = await Promise.all(
    folders.map(async (folder) => {
      const { data, error: listError } = await supabase.storage.from('blog-images').list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

      if (listError) {
        console.error(`Failed to list ${folder} images`, listError);
        return { folder, failed: true, files: [] };
      }

      return {
        folder,
        failed: false,
        files: (data ?? []).filter((file) => file.id && file.name && !file.name.startsWith('.'))
      };
    })
  );

  const images = listed
    .flatMap((entry) =>
      entry.files.map((file) => {
        const { data } = supabase.storage
          .from('blog-images')
          .getPublicUrl(`${entry.folder}/${file.name}`);
        return {
          url: data.publicUrl,
          name: file.name,
          folder: entry.folder,
          createdAt: file.created_at ?? ''
        };
      })
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ url, name, folder }) => ({ url, name, folder }));

  return {
    images,
    imageError: listed.some((entry) => entry.failed) ? 'Could not load the image library.' : null
  };
}

export async function uploadBlogImageFromForm(
  supabase: Client,
  form: FormData
): Promise<{ url: string } | { error: string }> {
  const folder = String(form.get('folder') ?? '');
  if (folder !== 'covers' && folder !== 'inline' && folder !== 'portraits') {
    return { error: 'Choose a cover, body, or portrait image.' };
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose an image to upload.' };
  }

  return uploadBlogImage(supabase, file, folder);
}

export type PostFormValues = {
  title: string;
  slug: string;
  description: string;
  date: string;
  categories: string;
  image: string;
  body: string;
  published: boolean;
};

export function readPostForm(form: FormData): PostFormValues {
  return {
    title: String(form.get('title') ?? ''),
    slug: String(form.get('slug') ?? ''),
    description: String(form.get('description') ?? ''),
    date: String(form.get('date') ?? ''),
    categories: String(form.get('categories') ?? ''),
    image: String(form.get('image') ?? ''),
    body: String(form.get('body') ?? ''),
    published: form.get('published') === 'on'
  };
}

export async function savePostFromForm(
  supabase: Client,
  form: FormData,
  existingId?: string
): Promise<{ slug: string } | { error: string; values: PostFormValues }> {
  const values = readPostForm(form);
  const title = values.title.trim();
  const slug = slugify(values.slug || title);
  const description = values.description.trim();
  const body = values.body;
  const date = values.date.trim();
  const categories = values.categories
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);

  if (!title || !slug || !description || !body.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      error: 'Title, slug, description, date, and body are required.',
      values: { ...values, slug }
    };
  }

  let image = values.image.trim() || null;
  const cover = form.get('cover');

  if (cover instanceof File && cover.size > 0) {
    const uploaded = await uploadBlogImage(supabase, cover, 'covers');
    if ('error' in uploaded) {
      return { error: uploaded.error, values: { ...values, slug } };
    }
    image = uploaded.url;
  }

  const row = {
    title,
    slug,
    description,
    date,
    categories,
    image,
    body,
    published: values.published,
    updated_at: new Date().toISOString()
  };

  const query = existingId
    ? supabase.from('posts').update(row).eq('id', existingId)
    : supabase.from('posts').insert(row);

  const { data, error: dbError } = await query.select('slug').single();

  if (dbError) {
    const message =
      dbError.code === '23505' ? 'A post with that slug already exists.' : dbError.message;
    return { error: message, values: { ...values, slug, image: image ?? '' } };
  }

  return { slug: data.slug };
}
