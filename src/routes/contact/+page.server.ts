import { loadResume } from '#lib/resume.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const resume = await loadResume(locals.supabase);
  return { resumeUrl: resume.url };
};
