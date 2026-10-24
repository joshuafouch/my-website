import { loadPersonal } from '#lib/about.ts';
import { openLinks } from '#lib/links.ts';
import { renderMarkdown } from '#lib/markdown.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const content = await loadPersonal(locals.supabase);
  const introHtml = content.intro.trim() ? openLinks(await renderMarkdown(content.intro)) : '';
  return { ...content, introHtml };
};
