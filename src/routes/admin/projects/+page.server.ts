import { getAdminProjects } from '#lib/server/admin-projects.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const projects = await getAdminProjects(locals.supabase);
  return { projects };
};
