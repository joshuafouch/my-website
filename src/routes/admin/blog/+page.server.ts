import { getAdminPosts } from '#lib/server/admin-posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const posts = await getAdminPosts(locals.supabase);
  return { posts };
};
