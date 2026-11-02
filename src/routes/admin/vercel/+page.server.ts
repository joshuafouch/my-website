import { requireAdmin } from '#lib/server/admin-posts.ts';
import { loadInfraReport } from '#lib/server/observability/vercel.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals.supabase);
	const infra = await loadInfraReport();
	return { infra };
};
