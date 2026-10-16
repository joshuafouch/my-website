import { getPublishedPosts } from '#lib/posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const posts = await getPublishedPosts(locals.supabase);

	if (posts.length === 0) {
		return { featuredPost: null };
	}

	// Same post all day; rotates by day of year.
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now.getTime() - start.getTime();
	const oneDay = 1000 * 60 * 60 * 24;
	const dayOfYear = Math.floor(diff / oneDay);
	const featuredPost = posts[dayOfYear % posts.length];

	return { featuredPost };
};
