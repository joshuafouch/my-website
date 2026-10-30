import { fail, isHttpError, redirect } from '@sveltejs/kit';
import { loadPersonal } from '#lib/about.ts';
import {
  deleteMusicImage,
  savePersonalFromForm,
  uploadMusicImage
} from '#lib/server/admin-about.ts';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import type { Actions, PageServerLoad } from './$types';

async function guard(supabase: Parameters<typeof requireAdmin>[0]) {
  try {
    await requireAdmin(supabase);
    return null;
  } catch (error) {
    if (isHttpError(error)) {
      return fail(error.status, {
        error: typeof error.body === 'object' && error.body && 'message' in error.body
          ? String(error.body.message)
          : 'Unauthorized'
      });
    }
    throw error;
  }
}

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireAdmin(locals.supabase);
  const content = await loadPersonal(locals.supabase);
  return { ...content, saved: url.searchParams.get('saved') === '1' };
};

export const actions: Actions = {
  uploadImage: async ({ request, locals }) => {
    const denied = await guard(locals.supabase);
    if (denied) return denied;
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return fail(400, { error: 'Choose an image.' });
    try {
      const result = await uploadMusicImage(locals.supabase, file, String(form.get('alt') ?? ''));
      if ('error' in result) return fail(400, { error: result.error });
      return { image: result.image };
    } catch (error) {
      if (isHttpError(error)) {
        return fail(error.status, { error: 'Unauthorized' });
      }
      console.error('Music image upload failed', error);
      return fail(500, { error: 'Could not upload that image.' });
    }
  },
  deleteImage: async ({ request, locals }) => {
    const denied = await guard(locals.supabase);
    if (denied) return denied;
    const form = await request.formData();
    try {
      const result = await deleteMusicImage(locals.supabase, String(form.get('id') ?? ''));
      if ('error' in result) return fail(400, { error: result.error });
      return { ok: true };
    } catch (error) {
      if (isHttpError(error)) {
        return fail(error.status, { error: 'Unauthorized' });
      }
      console.error('Music image delete failed', error);
      return fail(500, { error: 'Could not remove that image.' });
    }
  },
  // Named `save` (not `default`): SvelteKit forbids a default action alongside
  // named actions like uploadImage/deleteImage (action_default_with_named → 500).
  save: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await savePersonalFromForm(locals.supabase, form);

    if ('error' in result) {
      return fail(400, { error: result.error, content: result.content });
    }

    redirect(303, '/admin/about/personal?saved=1');
  }
};
