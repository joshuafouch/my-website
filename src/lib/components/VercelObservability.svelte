<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/env';
  import { page } from '$app/state';
  import { inject, pageview } from '@vercel/analytics';
  import { injectSpeedInsights } from '@vercel/speed-insights';

  // Skip in local dev — debug CDN scripts slow the site. Production only.
  // Generic injectors — @vercel/*/sveltekit still imports removed $app/stores (SK3).

  let setRoute: ((route: string | null) => void) | null = null;
  let ready = $state(false);

  onMount(() => {
    if (dev) return;

    inject({
      mode: 'production',
      disableAutoTrack: true,
      framework: 'sveltekit'
    });

    const insights = injectSpeedInsights({
      framework: 'sveltekit',
      route: page.route?.id ?? null
    });
    setRoute = insights?.setRoute ?? null;
    ready = true;
  });

  $effect(() => {
    if (dev || !ready) return;
    const routeId = page.route?.id ?? null;
    const path = page.url.pathname;
    if (!routeId) return;
    pageview({ route: routeId, path });
    setRoute?.(routeId);
  });
</script>
