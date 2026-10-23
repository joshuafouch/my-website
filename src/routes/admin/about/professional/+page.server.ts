import { fail, redirect } from '@sveltejs/kit';
import { loadProfessional } from '#lib/about.ts';
import { saveProfessionalFromForm } from '#lib/server/admin-about.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const content = await loadProfessional(locals.supabase);
  return { ...content, saved: url.searchParams.get('saved') === '1' };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const result = await saveProfessionalFromForm(locals.supabase, form);

    if ('error' in result) {
      return fail(400, { error: result.error, content: result.content });
    }

    redirect(303, '/admin/about/professional?saved=1');
  }
};
