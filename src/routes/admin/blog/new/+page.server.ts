import { fail, redirect } from '@sveltejs/kit';
import {
  listBlogImages,
  requireAdmin,
  savePostFromForm,
  uploadBlogImageFromForm
} from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return listBlogImages(locals.supabase);
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await savePostFromForm(locals.supabase, form);

    if ('error' in result) {
      return fail(400, { error: result.error, ...result.values });
    }

    redirect(303, `/admin/blog/${result.slug}?saved=1`);
  },

  upload: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const uploaded = await uploadBlogImageFromForm(locals.supabase, form);
    if ('error' in uploaded) return fail(400, { error: uploaded.error });
    return { url: uploaded.url };
  }
};
