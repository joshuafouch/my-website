import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';
import { slugify } from '#lib/slug.ts';

type Client = SupabaseClient<Database>;

const listColumns =
  'id, title, slug, description, details, date, image, source_url, tags, images, published' as const;

export type AdminProject = {
  id: string;
  title: string;
  slug: string;
  description: string;
  details: string;
  date: string;
  image: string;
  source_url: string | null;
  tags: string[];
  images: string[];
  published: boolean;
};

export async function getAdminProjects(supabase: Client): Promise<AdminProject[]> {
  const { data, error: dbError } = await supabase
    .from('projects')
    .select(listColumns)
    .order('date', { ascending: false });

  if (dbError) {
    console.error('Failed to list admin projects', dbError);
    error(500, 'Failed to load projects');
  }

  return data ?? [];
}

export async function getAdminProjectBySlug(supabase: Client, slug: string) {
  const { data, error: dbError } = await supabase
    .from('projects')
    .select(listColumns)
    .eq('slug', slug)
    .maybeSingle();

  if (dbError) {
    console.error('Failed to load admin project', dbError);
    error(500, 'Failed to load project');
  }

  return data;
}

export type ProjectFormValues = {
  id: string;
  title: string;
  slug: string;
  description: string;
  details: string;
  date: string;
  image: string;
  images: string;
  tags: string;
  sourceUrl: string;
  published: boolean;
};

export function readProjectForm(form: FormData): ProjectFormValues {
  return {
    id: String(form.get('id') ?? ''),
    title: String(form.get('title') ?? ''),
    slug: String(form.get('slug') ?? ''),
    description: String(form.get('description') ?? ''),
    details: String(form.get('details') ?? ''),
    date: String(form.get('date') ?? ''),
    image: String(form.get('image') ?? ''),
    images: String(form.get('images') ?? ''),
    tags: String(form.get('tags') ?? ''),
    sourceUrl: String(form.get('sourceUrl') ?? ''),
    published: form.get('published') === 'on'
  };
}

function splitList(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ];
}

export async function saveProjectFromForm(
  supabase: Client,
  form: FormData
): Promise<{ slug: string } | { error: string; values: ProjectFormValues }> {
  const values = readProjectForm(form);
  const title = values.title.trim();
  const slug = slugify(values.slug || title);
  const description = values.description.trim();
  const details = values.details.trim();
  const date = values.date.trim();
  const image = values.image.trim();
  const sourceUrl = values.sourceUrl.trim();
  const tags = splitList(values.tags);
  const images = splitList(values.images);
  const id = values.id.trim();
  const returned = { ...values, title, slug, description, details, date, image, sourceUrl };

  if (details.length > 12000) {
    return { error: 'The longer writeup needs to be shorter.', values: returned };
  }

  if (!title || !slug || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      error: 'Title, slug, and a valid date are required.',
      values: returned
    };
  }

  if (
    id &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  ) {
    return { error: 'That project could not be found.', values: returned };
  }

  const row = {
    title,
    slug,
    description,
    details,
    date,
    image,
    source_url: sourceUrl || null,
    tags,
    images,
    published: values.published,
    updated_at: new Date().toISOString()
  };

  const query = id
    ? supabase.from('projects').update(row).eq('id', id)
    : supabase.from('projects').insert(row);

  const { data, error: dbError } = await query.select('slug').single();

  if (dbError) {
    const message =
      dbError.code === '23505'
        ? 'A project with that slug already exists.'
        : dbError.code === 'PGRST116'
          ? 'That project could not be found.'
          : dbError.message;
    return { error: message, values: returned };
  }

  return { slug: data.slug };
}
