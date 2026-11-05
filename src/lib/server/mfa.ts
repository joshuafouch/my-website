import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';

type Client = SupabaseClient<Database>;

type MfaState = {
  needsMfa: boolean;
  currentLevel: 'aal1' | 'aal2' | null;
  nextLevel: 'aal1' | 'aal2';
};

/**
 * One lookup per request. locals.supabase is created per request, so it keys the cache: the
 * admin layout and page loads (which run in parallel) and form actions share a single getUser
 * round trip instead of making one each. Call forgetMfaState after anything that changes the
 * session (sign-in, MFA verification).
 */
const mfaStates = new WeakMap<Client, Promise<MfaState>>();

/**
 * MFA state from server-verified sources only: the `aal` claim from a verified JWT
 * (getClaims) and the factor list from the Auth server (getUser). The session cookie is
 * client-controlled, so its cached user.factors must not decide whether MFA is required.
 * Fails closed: if either lookup errors, MFA is treated as still required.
 */
export function getMfaState(supabase: Client): Promise<MfaState> {
  let state = mfaStates.get(supabase);
  if (!state) {
    state = readMfaState(supabase);
    mfaStates.set(supabase, state);
    // Don't keep a failure around for later callers in this request.
    state.catch(() => forgetMfaState(supabase));
  }
  return state;
}

export function forgetMfaState(supabase: Client) {
  mfaStates.delete(supabase);
}

async function readMfaState(supabase: Client): Promise<MfaState> {
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

  // The session is now aal2 (and a new factor may be verified).
  forgetMfaState(supabase);
  return { ok: true as const };
}
