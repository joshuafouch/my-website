import { fail, redirect } from '@sveltejs/kit';
import { isAdminEmail } from '#lib/admin.ts';
import { getMfaState } from '#lib/server/mfa.ts';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    // Same status, message and code path for every failure (unknown email, non-admin account,
    // wrong password), so responses don't reveal which address is the admin's. The sign-in is
    // always attempted so a non-admin email doesn't return measurably faster.
    const invalid = () => fail(400, { email, error: 'Email or password is incorrect.' });

    const { data, error: signInError } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError || !isAdminEmail(data.user?.email)) {
      // Valid credentials for a non-admin account: don't leave that session behind.
      if (!signInError) await locals.supabase.auth.signOut({ scope: 'local' });
      return invalid();
    }

    const mfa = await getMfaState(locals.supabase);
    redirect(303, mfa.needsMfa ? '/admin/login/mfa' : '/admin');
  }
};
