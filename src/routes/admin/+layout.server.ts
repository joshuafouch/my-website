import { redirect } from '@sveltejs/kit';
import { isAdminEmail } from '#lib/admin.ts';
import { getMfaState } from '#lib/server/mfa.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const { data, error } = await locals.supabase.auth.getClaims();
  const email =
    !error && data?.claims && typeof data.claims.email === 'string' ? data.claims.email : null;
  const isAdmin = isAdminEmail(email);
  const onPasswordLogin = url.pathname === '/admin/login';
  const onMfaChallenge = url.pathname === '/admin/login/mfa';
  const mfa = isAdmin ? await getMfaState(locals.supabase) : { needsMfa: false };

  if (!isAdmin && !onPasswordLogin) {
    redirect(303, '/admin/login');
  }

  if (isAdmin && mfa.needsMfa && !onMfaChallenge) {
    redirect(303, '/admin/login/mfa');
  }

  if (isAdmin && !mfa.needsMfa && (onPasswordLogin || onMfaChallenge)) {
    redirect(303, '/admin');
  }

  return { isAdmin, email, needsMfa: mfa.needsMfa };
};
