import { fail, redirect } from '@sveltejs/kit';
import { loadProfessional } from '#lib/about.ts';
import { saveProfessionalTech } from '#lib/server/admin-about.ts';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireAdmin(locals.supabase);
  const content = await loadProfessional(locals.supabase);
  return {
    techIntro: content.techIntro,
    groups: content.groups,
    saved: url.searchParams.get('saved') === '1'
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await saveProfessionalTech(locals.supabase, form);
    if ('error' in result) {
      return fail(400, {
        error: result.error,
        techIntro: result.techIntro ?? String(form.get('techIntro') ?? ''),
        groups: result.groups ?? []
      });
    }
    redirect(303, '/admin/about/professional/tech?saved=1');
  }
};
