import { getPublishedProjects } from '#lib/projects.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const projects = await getPublishedProjects(locals.supabase);
  return { projects };
};
