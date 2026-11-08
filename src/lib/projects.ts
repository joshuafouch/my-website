import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';
import type { Project } from '#lib/types.ts';

type Client = SupabaseClient<Database>;

type ProjectRow = Database['public']['Tables']['projects']['Row'];

/** One project page: everything, including the long write-up. */
const pageColumns =
  'title, slug, description, details, date, image, source_url, tags, images, published' as const;

/** The cards on /projects: no write-up (up to 12 KB a row) and no gallery. */
const cardColumns = 'title, slug, description, date, image, tags' as const;

export type ProjectCard = Pick<ProjectRow, 'title' | 'slug' | 'description' | 'date' | 'image'> & {
  tags: string[];
};

function mapProject(
  project: Pick<
    ProjectRow,
    | 'title'
    | 'slug'
    | 'description'
    | 'details'
    | 'date'
    | 'image'
    | 'source_url'
    | 'tags'
    | 'images'
    | 'published'
  >
): Project {
  return {
    title: project.title,
    slug: project.slug,
    description: project.description,
    details: project.details,
    date: project.date,
    image: project.image,
    sourceUrl: project.source_url || undefined,
    tags: project.tags ?? [],
    images: project.images ?? [],
    published: project.published
  };
}

export async function getPublishedProjectCards(supabase: Client): Promise<ProjectCard[]> {
  const { data, error: dbError } = await supabase
    .from('projects')
    .select(cardColumns)
    .eq('published', true)
    .order('date', { ascending: false });

  if (dbError) {
    console.error('Failed to load projects', dbError);
    error(500, 'Failed to load projects');
  }

  return (data ?? []).map((project) => ({ ...project, tags: project.tags ?? [] }));
}

/** Every published project's title and slug, newest first: enough for previous/next links. */
export async function getPublishedProjectTitles(
  supabase: Client
): Promise<{ title: string; slug: string }[]> {
  const { data, error: dbError } = await supabase
    .from('projects')
    .select('title, slug')
    .eq('published', true)
    .order('date', { ascending: false });

  if (dbError) {
    console.error('Failed to load project titles', dbError);
    error(500, 'Failed to load projects');
  }

  return data ?? [];
}

export async function getPublishedProjectBySlug(
  supabase: Client,
  slug: string
): Promise<Project | null> {
  const { data, error: dbError } = await supabase
    .from('projects')
    .select(pageColumns)
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle();

  if (dbError) {
    console.error('Failed to load project', dbError);
    error(500, 'Failed to load project');
  }

  return data ? mapProject(data) : null;
}
