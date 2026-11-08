import { getPublishedProjects } from '#lib/projects.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const projects = await getPublishedProjects(locals.supabase);
  // The cards don't show the write-up; it is rendered on each project's own page.
  return {
    projects: projects.map(({ title, slug, description, date, image, tags }) => ({
      title,
      slug,
      description,
      date,
      image,
      tags: tags ?? []
    }))
  };
};
