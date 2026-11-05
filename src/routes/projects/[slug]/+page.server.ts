import { error } from '@sveltejs/kit';
import { getPublishedProjectBySlug } from '#lib/projects.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const project = await getPublishedProjectBySlug(locals.supabase, params.slug);
  if (!project) error(404, `Could not find ${params.slug}`);
  // Only what the page's metadata needs; the dialog content comes from the layout's detailsHtml.
  const { title, description, slug, image } = project;
  return { project: { title, description, slug, image } };
};
