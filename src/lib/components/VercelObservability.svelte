<script lang="ts">
  import { dev } from '$app/env';
  import { page } from '$app/state';
  import { inject, pageview } from '@vercel/analytics';
  import { injectSpeedInsights } from '@vercel/speed-insights';

  // Skip in local dev — debug CDN scripts slow the site. Production only.
  // Generic injectors — @vercel/*/sveltekit still imports removed $app/stores (SK3).

  // Public site only. The scripts aren't loaded until a visitor is on a public page (an admin
  // session never downloads them), and any event for an /admin URL is dropped, in case a visitor
  // moves from the public site into the admin.
  const isAdminPath = (pathname: string) => pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminUrl = (url: string) => {
    try {
      return isAdminPath(new URL(url, location.origin).pathname);
    } catch {
      return false;
    }
  };

  let setRoute: ((route: string | null) => void) | null = null;
  let injected = false;

  $effect(() => {
    if (dev) return;
    const routeId = page.route?.id ?? null;
    const path = page.url.pathname;
    if (!routeId || isAdminPath(path)) return;

    if (!injected) {
      injected = true;
      inject({
        mode: 'production',
        disableAutoTrack: true,
        framework: 'sveltekit',
        beforeSend: (event) => (isAdminUrl(event.url) ? null : event)
      });
      const insights = injectSpeedInsights({
        framework: 'sveltekit',
        route: routeId,
        beforeSend: (event) => (isAdminUrl(event.url) ? null : event)
      });
      setRoute = insights?.setRoute ?? null;
    }

    pageview({ route: routeId, path });
    setRoute?.(routeId);
  });
</script>
