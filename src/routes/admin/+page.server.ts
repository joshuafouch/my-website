import { fail, redirect } from '@sveltejs/kit';
import {
  getAdminPosts,
  requireAdmin,
  savePostFromForm,
  uploadBlogImage
} from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const posts = await getAdminPosts(locals.supabase);
  return { posts };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await savePostFromForm(locals.supabase, form);

    if ('error' in result) {
      return fail(400, { error: result.error, ...result.values });
    }

    redirect(303, `/admin/${result.slug}?saved=1`);
  },

  inline: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const file = form.get('inline');
    const alt = String(form.get('alt') ?? '').trim() || 'image';

    if (!(file instanceof File) || file.size === 0) {
      return fail(400, { error: 'Choose an image to insert.' });
    }

    const uploaded = await uploadBlogImage(locals.supabase, file, 'inline');
    if ('error' in uploaded) {
      return fail(400, { error: uploaded.error });
    }

    const markdown = `\n![${alt.replaceAll(']', '')}](${uploaded.url})\n`;
    return { markdown };
  }
};
