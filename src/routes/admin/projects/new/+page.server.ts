import { fail, redirect } from '@sveltejs/kit';
import { saveProjectFromForm } from '#lib/server/admin-projects.ts';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import type { Actions } from './$types';

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
