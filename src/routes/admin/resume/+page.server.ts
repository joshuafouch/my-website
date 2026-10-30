import { fail, redirect } from '@sveltejs/kit';
import { loadResume } from '#lib/resume.ts';
import { uploadResume } from '#lib/server/admin-resume.ts';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireAdmin(locals.supabase);
  const resume = await loadResume(locals.supabase);
  return { resume, saved: url.searchParams.get('saved') === '1' };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const file = form.get('resume');
    const filename = String(form.get('filename') ?? '');

    if (!(file instanceof File)) {
      return fail(400, { error: 'Choose a PDF to upload.', filename });
    }

    const result = await uploadResume(locals.supabase, file, filename);
    if ('error' in result) {
      return fail(400, { error: result.error, filename });
    }

    redirect(303, '/admin/resume?saved=1');
  }
};
