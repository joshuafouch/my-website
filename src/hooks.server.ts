import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$app/env/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit/hooks';
import { dangerouslyDeleteByTag } from '@vercel/functions';

/** Vercel CDN cache tag on every cached public response; purged after admin writes. */
const CONTENT_TAG = 'content';

/**
 * Public pages are cached at Vercel's CDN (not in browsers: they keep revalidating). Admin saves
 * purge the tag, so edits show up immediately; the TTL only bounds changes made outside the admin
 * (e.g. in the Supabase dashboard). Stale copies are served while a fresh one renders.
 */
const PUBLIC_CDN_CACHE = 'public, max-age=3600, stale-while-revalidate=86400';

/** Admin POSTs that don't change site content (no purge needed). */
const AUTH_ONLY_POSTS = /^\/admin\/(login(\/mfa)?|logout|mfa)\/?$/;

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  const adminArea = path === '/admin' || path.startsWith('/admin/');

  // @supabase/ssr writes cookies from an auth-state callback, which can fire after the response
  // is generated (e.g. a token refresh that finishes late). SvelteKit throws on cookies.set at
  // that point, and as an unhandled rejection it crashes the server. Once responded, drop writes.
  let responded = false;

  // Any failed Supabase request makes this response uncacheable, so a transient outage can't be
  // cached as an empty page (several loaders log and fall back to empty data; data requests
  // report load errors inside a 200).
  let upstreamFailed = false;
  const trackedFetch: typeof fetch = async (input, init) => {
    try {
      const res = await fetch(input, init);
      if (!res.ok) upstreamFailed = true;
      return res;
    } catch (error) {
      upstreamFailed = true;
      throw error;
    }
  };

  // Only the admin area sees the session. Public pages query Supabase anonymously, so they render
  // the same for every visitor and never emit Set-Cookie, which makes them safe to cache.
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: { fetch: trackedFetch },
    cookies: {
      getAll: () => (adminArea ? event.cookies.getAll() : []),
      setAll: (cookiesToSet, headers) => {
        if (!adminArea) return;
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
  // instead of racing it. Only for admin requests that carry a Supabase auth cookie.
  if (
    adminArea &&
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

  if (adminArea) {
    // Every content change goes through an admin form action, so purge cached public pages after
    // one. A no-op outside Vercel (dev/preview).
    if (event.request.method === 'POST' && !AUTH_ONLY_POSTS.test(path)) {
      await dangerouslyDeleteByTag(CONTENT_TAG).catch((error: unknown) => {
        console.error('[cache] failed to purge cached public pages', error);
      });
    }
  } else if (
    !upstreamFailed &&
    isCacheablePublicResponse(event.request.method, event.isDataRequest, response)
  ) {
    response.headers.set('Vercel-CDN-Cache-Control', PUBLIC_CDN_CACHE);
    response.headers.set('Vercel-Cache-Tag', CONTENT_TAG);
  }

  return response;
};

function isCacheablePublicResponse(method: string, isDataRequest: boolean, response: Response) {
  if (method !== 'GET' && method !== 'HEAD') return false;
  if (response.status !== 200) return false;
  if (response.headers.has('set-cookie')) return false;
  // Kit marks every __data.json (client-side navigation data) `private, no-store` because data
  // can be per-user. Outside /admin it can't be here (no session), so the CDN may cache it; the
  // browser still gets Kit's header. For anything else, respect a route's private/no-store.
  if (isDataRequest) return true;
  const cacheControl = response.headers.get('cache-control') ?? '';
  return !/\b(private|no-store)\b/i.test(cacheControl);
}

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()'
};
