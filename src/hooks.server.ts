import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit/hooks';

export const handle: Handle = async ({ event, resolve }) => {
  // @supabase/ssr writes cookies from an auth-state callback, which can fire after the response
  // is generated (e.g. a token refresh that finishes late). SvelteKit throws on cookies.set at
  // that point, and as an unhandled rejection it crashes the server. Once responded, drop writes.
  let responded = false;

  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        if (responded) {
          console.warn('[auth] ignored Supabase cookie update after the response was sent');
          return;
        }
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
        if (Object.keys(headers).length > 0) {
          event.setHeaders(headers);
        }
      }
    }
  });

  // Settle the session before rendering: an expired access token is refreshed (or a dead session,
  // e.g. "refresh_token_not_found", is cleared) here, so the cookie update reaches this response
  // instead of racing it. Only for requests that carry a Supabase auth cookie (the admin).
  if (
    event.cookies
      .getAll()
      .some(({ name }) => name.startsWith('sb-') && name.includes('-auth-token'))
  ) {
    await event.locals.supabase.auth.getClaims();
  }

  const response = await resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });

  responded = true;

  // CSP is set by Kit (csp in vite.config.ts); HSTS is added by Vercel.
  for (const [name, value] of Object.entries(securityHeaders)) {
    if (!response.headers.has(name)) response.headers.set(name, value);
  }
  return response;
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()'
};
