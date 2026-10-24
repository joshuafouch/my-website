import { fail, redirect } from '@sveltejs/kit';
import { loadPersonal } from '#lib/about.ts';
import { savePersonalFromForm } from '#lib/server/admin-about.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const content = await loadPersonal(locals.supabase);
  return { ...content, saved: url.searchParams.get('saved') === '1' };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const result = await savePersonalFromForm(locals.supabase, form);

    if ('error' in result) {
      return fail(400, { error: result.error, content: result.content });
    }

    redirect(303, '/admin/about/personal?saved=1');
  }
};
