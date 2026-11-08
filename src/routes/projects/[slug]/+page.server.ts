import { error } from '@sveltejs/kit';
import { openLinks } from '#lib/links.ts';
import { getPublishedProjects } from '#lib/projects.ts';
import { renderMarkdown } from '#lib/server/markdown.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  // The list gives the previous/next links too; it is small, so one query covers both.
  const projects = await getPublishedProjects(locals.supabase);
  const index = projects.findIndex((project) => project.slug === params.slug);
  if (index === -1) error(404, `Could not find ${params.slug}`);

  const { details, ...project } = projects[index];
  const neighbour = (offset: number) => {
    if (projects.length < 2) return null;
    const { title, slug } = projects[(index + offset + projects.length) % projects.length];
    return { title, slug };
  };

  return {
    project: {
      ...project,
      // Rendered here so the browser gets finished HTML: no marked/sanitizer download.
      detailsHtml: details?.trim() ? openLinks(await renderMarkdown(details)) : ''
    },
    previous: neighbour(-1),
    next: neighbour(1)
  };
};
