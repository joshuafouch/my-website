import { loadResume } from '#lib/resume.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return { resume: await loadResume(locals.supabase) };
};
