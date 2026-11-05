import { openLinks } from '#lib/links.ts';
import { getPublishedProjects } from '#lib/projects.ts';
import { renderMarkdown } from '#lib/server/markdown.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const projects = await getPublishedProjects(locals.supabase);
  // Render details here so the browser gets finished HTML: no marked/sanitizer download, no
  // pop-in after hydration. The raw markdown isn't sent.
  return {
    projects: await Promise.all(
      projects.map(async ({ details, ...project }) => ({
        ...project,
        detailsHtml: details?.trim() ? openLinks(await renderMarkdown(details)) : ''
      }))
    )
  };
};
