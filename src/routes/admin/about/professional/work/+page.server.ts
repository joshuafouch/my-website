import { fail, redirect } from '@sveltejs/kit';
import { loadProfessional } from '#lib/about.ts';
import { saveProfessionalWork } from '#lib/server/admin-about.ts';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireAdmin(locals.supabase);
  const content = await loadProfessional(locals.supabase);
  return {
    workIntro: content.workIntro,
    jobs: content.jobs,
    saved: url.searchParams.get('saved') === '1'
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await saveProfessionalWork(locals.supabase, form);
    if ('error' in result) {
      return fail(400, {
        error: result.error,
        workIntro: result.workIntro ?? String(form.get('workIntro') ?? ''),
        jobs: result.jobs ?? []
      });
    }
    redirect(303, '/admin/about/professional/work?saved=1');
  }
};
