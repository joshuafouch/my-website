import { error } from '@sveltejs/kit';
import { renderMarkdown } from '#lib/server/markdown.ts';
import { getPublishedPostBySlug, getPublishedPostTitles } from '#lib/posts.ts';
import { isSlugLike } from '#lib/slug.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Any single-segment path lands here, scanners included: answer those without a query.
  if (!isSlugLike(params.slug)) error(404, `Could not find ${params.slug}`);

  const post = await getPublishedPostBySlug(locals.supabase, params.slug);
  if (!post) error(404, `Could not find ${params.slug}`);

  // Only once the post exists: titles and slugs for the previous/next links. Newest first, so the
  // one after this in the list is the earlier post.
  const [posts, html] = await Promise.all([
    getPublishedPostTitles(locals.supabase),
    renderMarkdown(post.body)
  ]);
  const index = posts.findIndex((entry) => entry.slug === post.slug);
  const neighbour = (offset: number) => {
    const entry = index === -1 ? undefined : posts[index + offset];
    return entry ? { title: entry.title, slug: entry.slug } : null;
  };

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
