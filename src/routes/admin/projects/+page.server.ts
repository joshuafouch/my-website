import { getAdminProjects } from '#lib/server/admin-projects.ts';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  await requireAdmin(locals.supabase);
  const projects = await getAdminProjects(locals.supabase);
  return { projects };
};
