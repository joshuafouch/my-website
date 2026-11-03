import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';

type Client = SupabaseClient<Database>;

/**
 * MFA state from server-verified sources only: the `aal` claim from a verified JWT
 * (getClaims) and the factor list from the Auth server (getUser). The session cookie is
 * client-controlled, so its cached user.factors must not decide whether MFA is required.
 * Fails closed: if either lookup errors, MFA is treated as still required.
 */
export async function getMfaState(supabase: Client) {
  const [claimsResult, userResult] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getUser()
  ]);

  if (
    claimsResult.error ||
    !claimsResult.data?.claims ||
    userResult.error ||
    !userResult.data.user
  ) {
    return { needsMfa: true, currentLevel: null, nextLevel: 'aal2' as const };
  }

  const currentLevel = claimsResult.data.claims.aal === 'aal2' ? 'aal2' : 'aal1';
  const hasVerifiedFactor = (userResult.data.user.factors ?? []).some(
    (factor) => factor.status === 'verified'
  );
  const nextLevel = hasVerifiedFactor ? 'aal2' : 'aal1';

  return {
    needsMfa: nextLevel === 'aal2' && currentLevel !== 'aal2',
    currentLevel,
    nextLevel
  };
}

export async function verifyTotpCode(supabase: Client, factorId: string, code: string) {
  const trimmed = code.replace(/\s/g, '');

  if (!/^\d{6}$/.test(trimmed)) {
    return { error: 'Enter the 6-digit code from your authenticator app.' };
  }

  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) {
    return { error: challenge.error.message };
  }

  const verified = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code: trimmed
  });

  if (verified.error) {
    return { error: 'That code is incorrect. Wait for the next one and try again.' };
  }

  return { ok: true as const };
}
