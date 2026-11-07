import { error } from '@sveltejs/kit';
import { renderMarkdown } from '#lib/server/markdown.ts';
import { getPublishedPostBySlug } from '#lib/posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const post = await getPublishedPostBySlug(locals.supabase, params.slug);

	if (!post) error(404, `Could not find ${params.slug}`);

	const html = await renderMarkdown(post.body);
	return {
		html,
		meta: {
			title: post.title,
			slug: post.slug,
			description: post.description,
			date: post.date,
			categories: post.categories ?? [],
			image: post.image ?? ''
		}
	};
};
