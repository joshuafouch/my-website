import { loadProfessional } from '#lib/about.ts';
import { openLinks } from '#lib/links.ts';
import { renderMarkdown } from '#lib/markdown.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const content = await loadProfessional(locals.supabase);
  const introHtml = content.intro.trim() ? openLinks(await renderMarkdown(content.intro)) : '';
  const jobs = await Promise.all(
    content.jobs.map(async (job) => ({
      ...job,
      body: job.body.trim() ? openLinks(await renderMarkdown(job.body)) : ''
    }))
  );
  return { ...content, introHtml, jobs };
};
