import { requireAdmin } from '#lib/server/admin-posts.ts';
import { loadTrafficReport } from '#lib/server/observability/vercel.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals.supabase);
	const traffic = await loadTrafficReport(14);
	return { traffic };
};
