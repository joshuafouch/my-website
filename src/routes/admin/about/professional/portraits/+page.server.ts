import { fail, redirect } from '@sveltejs/kit';
import { loadProfessional } from '#lib/about.ts';
import { saveProfessionalPortraits } from '#lib/server/admin-about.ts';
import {
  listBlogImages,
  requireAdmin,
  uploadBlogImageFromForm
} from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireAdmin(locals.supabase);
  const content = await loadProfessional(locals.supabase);
  const images = await listBlogImages(locals.supabase, ['portraits']);
  return {
    portraits: content.portraits,
    saved: url.searchParams.get('saved') === '1',
    ...images
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await saveProfessionalPortraits(locals.supabase, form);
    if ('error' in result) {
      return fail(400, { error: result.error, portraits: result.portraits ?? [] });
    }
    redirect(303, '/admin/about/professional/portraits?saved=1');
  },

  upload: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const uploaded = await uploadBlogImageFromForm(locals.supabase, form);
    if ('error' in uploaded) return fail(400, { error: uploaded.error });
    return { url: uploaded.url };
  }
};
