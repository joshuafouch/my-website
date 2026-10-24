import { error, fail, redirect } from '@sveltejs/kit';
import { getAdminProjectBySlug, saveProjectFromForm } from '#lib/server/admin-projects.ts';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  const project = await getAdminProjectBySlug(locals.supabase, params.slug);
  if (!project) error(404, `Could not find ${params.slug}`);
  return { project, saved: url.searchParams.has('saved') };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await saveProjectFromForm(locals.supabase, form);

    if ('error' in result) {
      return fail(400, { error: result.error, ...result.values });
    }

    redirect(303, `/admin/projects/${result.slug}?saved=1`);
  }
};
