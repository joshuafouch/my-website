import { error } from '@sveltejs/kit';
import { renderMarkdown } from '#lib/markdown.ts';
import { getPublishedPostBySlug } from '#lib/posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const post = await getPublishedPostBySlug(locals.supabase, params.slug);

	if (post) {
		const html = await renderMarkdown(post.body);
		return {
			html,
			meta: {
				title: post.title,
				slug: post.slug,
				description: post.description,
				date: post.date,
				categories: post.categories ?? [],
				image: post.image ?? '',
				published: post.published,
				type: 'post' as const
			}
		};
	}

	try {
		const project = await import(`../../projects/${params.slug}.md`);
		return {
			content: project.default,
			meta: { ...project.metadata, slug: params.slug, type: 'project' as const }
		};
	} catch {
		error(404, `Could not find ${params.slug}`);
	}
};
