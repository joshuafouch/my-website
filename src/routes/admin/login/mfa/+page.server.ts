import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import { verifyTotpCode } from '#lib/server/mfa.ts';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const code = String(form.get('code') ?? '');

    const factors = await locals.supabase.auth.mfa.listFactors();
    if (factors.error) {
      return fail(400, { error: factors.error.message });
    }

    const factor = factors.data.totp.find((item) => item.status === 'verified');
    if (!factor) {
      return fail(400, { error: 'No authenticator is enrolled on this account.' });
    }

    const result = await verifyTotpCode(locals.supabase, factor.id, code);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    redirect(303, '/admin');
  }
};
