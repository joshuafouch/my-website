import { json } from '@sveltejs/kit';
import { getPublishedPosts } from '#lib/posts.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const posts = await getPublishedPosts(locals.supabase);
	return json(posts);
};
