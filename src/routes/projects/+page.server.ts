import { getPublishedProjectCards } from '#lib/projects.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // The cards don't show the write-up; it is rendered on each project's own page.
  return { projects: await getPublishedProjectCards(locals.supabase) };
};
