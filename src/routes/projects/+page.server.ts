import { getPublishedProjects } from '#lib/projects.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const projects = await getPublishedProjects(locals.supabase);
  return { projects };
};
