import { fail, redirect } from '@sveltejs/kit';
import { loadProfessional } from '#lib/about.ts';
import { saveProfessionalIntro } from '#lib/server/admin-about.ts';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireAdmin(locals.supabase);
  const content = await loadProfessional(locals.supabase);
  return { intro: content.intro, saved: url.searchParams.get('saved') === '1' };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await saveProfessionalIntro(locals.supabase, form);
    if ('error' in result) {
      return fail(400, { error: result.error, intro: result.intro ?? String(form.get('intro') ?? '') });
    }
    redirect(303, '/admin/about/professional/intro?saved=1');
  }
};
