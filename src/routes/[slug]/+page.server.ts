import { error } from '@sveltejs/kit';
import { renderMarkdown } from '#lib/server/markdown.ts';
import { getPublishedPostBySlug, getPublishedPosts } from '#lib/posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const [post, posts] = await Promise.all([
    getPublishedPostBySlug(locals.supabase, params.slug),
    getPublishedPosts(locals.supabase)
  ]);

  if (!post) error(404, `Could not find ${params.slug}`);

  // Posts come newest first: the one after this in the list is the earlier post.
  const index = posts.findIndex((entry) => entry.slug === post.slug);
  const neighbour = (offset: number) => {
    const entry = index === -1 ? undefined : posts[index + offset];
    return entry ? { title: entry.title, slug: entry.slug } : null;
  };

  const html = await renderMarkdown(post.body);
  return {
    html,
    earlier: neighbour(1),
    later: neighbour(-1),
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
