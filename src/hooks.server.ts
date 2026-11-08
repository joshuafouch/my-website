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

/**
 * Not-found pages, briefly: scanners requesting /wp-login.php and friends would otherwise run the
 * function every time. Publishing purges the tag, so a new post never stays hidden behind a 404.
 */
const NOT_FOUND_CDN_CACHE = 'public, max-age=300';

/** Admin POSTs that don't change site content (no purge needed). */
const AUTH_ONLY_POSTS = /^\/admin\/(login(\/mfa)?|logout|mfa)\/?$/;

/**
 * The admin session cookies. @supabase/ssr sets them readable by page scripts and for 400 days;
 * nothing in the browser needs them (all auth runs on the server), so they are HttpOnly, and an
 * unused session lapses after two weeks. Every token refresh re-sets them, so active use slides on.
 */
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

const isAdminPath = (value: string | null | undefined) =>
  value === '/admin' || (value?.startsWith('/admin/') ?? false);

export const handle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  // The route id as well as the raw path: an encoded path (/%61dmin) still routes to the admin.
  const adminArea = isAdminPath(path) || isAdminPath(event.route.id);

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
          event.cookies.set(name, value, {
            ...options,
            path: '/',
            httpOnly: true,
            // 0 deletes the cookie (sign-out); keep that as is.
            maxAge:
              options.maxAge === 0
                ? 0
                : Math.min(options.maxAge ?? AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_MAX_AGE)
          });
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
    // Never stored by the browser (no back-button copy after logging out), never indexed.
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');

    // Every content change goes through an admin form action, so purge cached public pages after
    // one that succeeded. Failed actions answer 4xx/5xx (fail(), error()) in both the plain-form
    // and the enhanced (fetch) case, so a rejected save leaves the cache alone. A no-op outside
    // Vercel (dev/preview).
    if (event.request.method === 'POST' && response.status < 400 && !AUTH_ONLY_POSTS.test(path)) {
      await dangerouslyDeleteByTag(CONTENT_TAG).catch((error: unknown) => {
        console.error('[cache] failed to purge cached public pages', error);
      });
    }
  } else {
    if (!upstreamFailed) {
      const cdnCache = publicCdnCache(event.request.method, event.isDataRequest, response);
      if (cdnCache) {
        response.headers.set('Vercel-CDN-Cache-Control', cdnCache);
        response.headers.set('Vercel-Cache-Tag', CONTENT_TAG);
      }
    }
    // Browsers always revalidate pages (Vercel's own default, made explicit). Explicit matters:
    // vercel.json gives /assets/* a month of caching, and without a header of its own a 404 for
    // a missing asset would pick that up.
    if (!response.headers.has('cache-control')) {
      response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }

  return response;
};

/** The CDN cache policy for a public response, or null to leave it uncached. */
function publicCdnCache(method: string, isDataRequest: boolean, response: Response) {
  if (method !== 'GET' && method !== 'HEAD') return null;
  if (response.status !== 200 && response.status !== 404) return null;
  if (response.headers.has('set-cookie')) return null;
  const policy = response.status === 404 ? NOT_FOUND_CDN_CACHE : PUBLIC_CDN_CACHE;
  // Kit marks every __data.json (client-side navigation data) `private, no-store` because data
  // can be per-user. Outside /admin it can't be here (no session), so the CDN may cache it; the
  // browser still gets Kit's header. For anything else, respect a route's private/no-store.
  if (isDataRequest) return policy;
  const cacheControl = response.headers.get('cache-control') ?? '';
  return /\b(private|no-store)\b/i.test(cacheControl) ? null : policy;
}

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  // A cross-origin page that opens this one (or that this one is opened from) gets no handle on
  // it. allow-popups keeps popups this site opens working (the Vercel Toolbar sign-in on previews).
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
};
