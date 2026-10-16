import { redirect } from '@sveltejs/kit';
import { isAdminEmail } from '#lib/admin.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { data, error } = await locals.supabase.auth.getClaims();
	const email =
		!error && data?.claims && typeof data.claims.email === 'string'
			? data.claims.email
			: null;
	const isAdmin = isAdminEmail(email);
	const onLoginPage = url.pathname === '/admin/login' || url.pathname.startsWith('/admin/login/');

	// Logged-in admin visiting login → go to the editor shell
	if (onLoginPage && isAdmin) {
		redirect(303, '/admin');
	}

	// Everyone else must sign in before seeing any /admin page
	if (!onLoginPage && !isAdmin) {
		redirect(303, '/admin/login');
	}

	return { isAdmin, email };
};
