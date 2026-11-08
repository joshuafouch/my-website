import { requireAdmin } from '#lib/server/admin-posts.ts';
import { loadSupabaseUsage } from '#lib/server/observability/supabase-usage.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  await requireAdmin(locals.supabase);
  const usage = await loadSupabaseUsage(locals.supabase);
  return { usage };
};
