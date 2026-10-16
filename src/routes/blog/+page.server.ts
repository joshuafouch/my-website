import { getPublishedPosts } from '#lib/posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const posts = await getPublishedPosts(locals.supabase);
	return { posts };
};
