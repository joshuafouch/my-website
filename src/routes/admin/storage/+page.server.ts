import { fail } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import {
  deleteStorageAsset,
  loadStorageInventory,
  uploadStorageAsset,
  UPLOAD_TARGETS
} from '#lib/server/observability/storage-inventory.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  await requireAdmin(locals.supabase);
  const inventory = await loadStorageInventory(locals.supabase);
  return {
    ...inventory,
    targets: UPLOAD_TARGETS,
    saved: url.searchParams.get('saved') === '1',
    deleted: url.searchParams.get('deleted') === '1'
  };
};

export const actions: Actions = {
  upload: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await uploadStorageAsset(locals.supabase, form);
    if ('error' in result) return fail(400, { error: result.error });
    return { ok: true, message: result.message };
  },
  delete: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const result = await deleteStorageAsset(locals.supabase, form);
    if ('error' in result) return fail(400, { error: result.error });
    return { ok: true, message: result.message };
  }
};
