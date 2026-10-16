import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: {
		public: true,
		schema: (value) => {
			if (!value) throw new Error('PUBLIC_SUPABASE_URL is required');
			return value;
		}
	},
	PUBLIC_SUPABASE_ANON_KEY: {
		public: true,
		schema: (value) => {
			if (!value) throw new Error('PUBLIC_SUPABASE_ANON_KEY is required');
			return value;
		}
	},
	// Private: only used on the server to gate /admin
	ADMIN_EMAIL: {
		schema: (value) => {
			if (!value) throw new Error('ADMIN_EMAIL is required');
			return value;
		}
	}
});
