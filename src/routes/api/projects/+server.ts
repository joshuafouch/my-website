import { json } from '@sveltejs/kit';
import { getPublishedProjects } from '#lib/projects.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const projects = await getPublishedProjects(locals.supabase);
  return json(projects);
};
