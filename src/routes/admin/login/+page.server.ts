import { fail, redirect } from '@sveltejs/kit';
import { isAdminEmail } from '#lib/admin.ts';
import { getMfaState } from '#lib/server/mfa.ts';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!isAdminEmail(email)) {
      return fail(403, { email, error: 'This account cannot access admin.' });
    }

    const { error: signInError } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      return fail(400, { email, error: 'Email or password is incorrect.' });
    }

    const mfa = await getMfaState(locals.supabase);
    redirect(303, mfa.needsMfa ? '/admin/login/mfa' : '/admin');
  }
};
