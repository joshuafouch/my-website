import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  await requireAdmin(locals.supabase);
  redirect(303, '/admin/about/professional/intro');
};
