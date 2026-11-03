import { fail, redirect } from '@sveltejs/kit';
import { loadPersonal } from '#lib/about.ts';
import { savePortraits } from '#lib/server/admin-about.ts';
import {
  listPortraitImages,
  requireAdmin,
  uploadPortraitImageFromForm
} from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireAdmin(locals.supabase);
  const content = await loadPersonal(locals.supabase);
  const images = await listPortraitImages(locals.supabase, 'personal');
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
    const result = await savePortraits(locals.supabase, form, 'personal');
    if ('error' in result) {
      return fail(400, { error: result.error, portraits: result.portraits ?? [] });
    }
    redirect(303, '/admin/about/personal/portraits?saved=1');
  },

  upload: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const uploaded = await uploadPortraitImageFromForm(locals.supabase, form);
    if ('error' in uploaded) return fail(400, { error: uploaded.error });
    return { url: uploaded.url };
  }
};
