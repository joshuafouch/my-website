import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	return {
		cookies: cookies.getAll(),
		url: url.pathname
	};
};
