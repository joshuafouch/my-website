import { ADMIN_EMAIL } from '$app/env/private';

/** True when the signed-in user's email is the configured admin. */
export function isAdminEmail(email: string | null | undefined): boolean {
	return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
