import { error } from '@sveltejs/kit';
import { openLinks } from '#lib/links.ts';
import { getPublishedProjectBySlug, getPublishedProjectTitles } from '#lib/projects.ts';
import { renderMarkdown } from '#lib/server/markdown.ts';
import { isSlugLike } from '#lib/slug.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!isSlugLike(params.slug)) error(404, `Could not find ${params.slug}`);

  const found = await getPublishedProjectBySlug(locals.supabase, params.slug);
  if (!found) error(404, `Could not find ${params.slug}`);

  const { details, ...project } = found;
  const [projects, detailsHtml] = await Promise.all([
    // Titles and slugs only, for the previous/next links (they wrap around).
    getPublishedProjectTitles(locals.supabase),
    // Rendered here so the browser gets finished HTML: no marked/sanitizer download.
    details?.trim() ? renderMarkdown(details).then(openLinks) : Promise.resolve('')
  ]);

  const index = projects.findIndex((entry) => entry.slug === project.slug);
  const neighbour = (offset: number) => {
    if (index === -1 || projects.length < 2) return null;
    const { title, slug } = projects[(index + offset + projects.length) % projects.length];
    return { title, slug };
  };

  return {
    project: { ...project, detailsHtml },
    previous: neighbour(-1),
    next: neighbour(1)
  };
};
