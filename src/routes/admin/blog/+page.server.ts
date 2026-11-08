import { getAdminPosts, requireAdmin } from '#lib/server/admin-posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  await requireAdmin(locals.supabase);
  const posts = await getAdminPosts(locals.supabase);
  return { posts };
};
