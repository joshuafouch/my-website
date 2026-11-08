import { error, fail, redirect } from '@sveltejs/kit';
import {
  getAdminPostBySlug,
  listBlogImages,
  requireAdmin,
  savePostFromForm,
  uploadBlogImageFromForm
} from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
  await requireAdmin(locals.supabase);
  const post = await getAdminPostBySlug(locals.supabase, params.slug);
  if (!post) error(404, `Could not find ${params.slug}`);

  const images = await listBlogImages(locals.supabase);
  return { post, saved: url.searchParams.has('saved'), ...images };
};

export const actions: Actions = {
  save: async ({ request, locals, params }) => {
    await requireAdmin(locals.supabase);
    const existing = await getAdminPostBySlug(locals.supabase, params.slug);
    if (!existing) error(404, `Could not find ${params.slug}`);

    const form = await request.formData();
    const result = await savePostFromForm(locals.supabase, form, existing.id);

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
