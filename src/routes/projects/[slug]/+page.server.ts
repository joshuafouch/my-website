import { error } from '@sveltejs/kit';
import { getPublishedProjectBySlug } from '#lib/projects.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const project = await getPublishedProjectBySlug(locals.supabase, params.slug);
  if (!project) error(404, `Could not find ${params.slug}`);
  return { project };
};
