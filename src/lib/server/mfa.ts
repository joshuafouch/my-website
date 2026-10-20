import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '#lib/database.types.ts';

type Client = SupabaseClient<Database>;

export async function getMfaState(supabase: Client) {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error || !data) {
    return { needsMfa: false, currentLevel: null, nextLevel: null };
  }

  return {
    needsMfa: data.nextLevel === 'aal2' && data.currentLevel !== 'aal2',
    currentLevel: data.currentLevel,
    nextLevel: data.nextLevel
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
