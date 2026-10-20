import { fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/admin-posts.ts';
import { getMfaState, verifyTotpCode } from '#lib/server/mfa.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const mfa = await getMfaState(locals.supabase);
  return { enrolled: mfa.nextLevel === 'aal2' };
};

export const actions: Actions = {
  start: async ({ locals }) => {
    await requireAdmin(locals.supabase);
    const existing = await locals.supabase.auth.mfa.listFactors();
    if (existing.error) {
      return fail(400, { error: existing.error.message });
    }

    for (const factor of existing.data.all) {
      if (factor.status !== 'verified') {
        await locals.supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
    }

    const enrolled = await locals.supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Admin authenticator',
      issuer: 'joshuafouch.com'
    });

    if (enrolled.error || !enrolled.data.totp) {
      return fail(400, {
        error: enrolled.error?.message ?? 'Could not start authenticator setup.'
      });
    }

    return {
      factorId: enrolled.data.id,
      qr: enrolled.data.totp.qr_code,
      secret: enrolled.data.totp.secret
    };
  },

  confirm: async ({ request, locals }) => {
    await requireAdmin(locals.supabase);
    const form = await request.formData();
    const factorId = String(form.get('factorId') ?? '');
    const qr = String(form.get('qr') ?? '');
    const secret = String(form.get('secret') ?? '');
    const code = String(form.get('code') ?? '');

    const result = await verifyTotpCode(locals.supabase, factorId, code);
    if ('error' in result) {
      return fail(400, { error: result.error, factorId, qr, secret });
    }

    redirect(303, '/admin');
  }
};
