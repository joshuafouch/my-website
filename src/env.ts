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
  },
  // Optional: admin observability dashboards (free Vercel / Supabase APIs)
  VERCEL_TOKEN: {
    schema: (value) => value ?? ''
  },
  VERCEL_PROJECT_ID: {
    schema: (value) => value ?? ''
  },
  VERCEL_TEAM_ID: {
    schema: (value) => value ?? ''
  },
  SUPABASE_ACCESS_TOKEN: {
    schema: (value) => value ?? ''
  },
  SUPABASE_PROJECT_REF: {
    schema: (value) => {
      const raw = (value ?? '').trim();
      if (!raw) return '';
      // Accept either the bare ref or a full https://xxxx.supabase.co URL.
      try {
        if (raw.includes('://')) {
          const host = new URL(raw).hostname;
          const match = host.match(/^([a-z0-9-]+)\.supabase\.co$/i);
          if (match) return match[1];
        }
      } catch {
        // fall through
      }
      return raw.replace(/\.supabase\.co$/i, '').replace(/^https?:\/\//i, '');
    }
  }
});
