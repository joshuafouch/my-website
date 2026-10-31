import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';
import type { Project } from '#lib/types.ts';

type Client = SupabaseClient<Database>;

const listColumns =
  'title, slug, description, details, date, image, source_url, tags, images, published' as const;

type ProjectListRow = Pick<
  Database['public']['Tables']['projects']['Row'],
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
>;

function mapProject(project: ProjectListRow): Project {
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

export async function getPublishedProjects(supabase: Client): Promise<Project[]> {
  const { data, error: dbError } = await supabase
    .from('projects')
    .select(listColumns)
    .eq('published', true)
    .order('date', { ascending: false });

  if (dbError) {
    console.error('Failed to load projects', dbError);
    error(500, 'Failed to load projects');
  }

  return (data ?? []).map(mapProject);
}

export async function getPublishedProjectBySlug(
  supabase: Client,
  slug: string
): Promise<Project | null> {
  const { data, error: dbError } = await supabase
    .from('projects')
    .select(listColumns)
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle();

  if (dbError) {
    console.error('Failed to load project', dbError);
    error(500, 'Failed to load project');
  }

  return data ? mapProject(data) : null;
}
