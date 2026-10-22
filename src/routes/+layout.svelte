<script lang="ts">
  import '../app.css';
  import Navbar from '#lib/components/Navbar.svelte';
  import Footer from '#lib/components/Footer.svelte';
  import Transition from '#lib/components/Transition.svelte';
  import SiteBackdrop from '#lib/components/SiteBackdrop.svelte';
  import BackgroundSwitch from '#lib/components/BackgroundSwitch.svelte';
  import { onNavigate } from '$app/navigation';

  let { children, data } = $props();

  const isLanding = $derived(data.url === '/');

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    const from = navigation.from?.url.pathname;
    const to = navigation.to?.url.pathname;
    if (!from || !to || from === to) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const kind = from === '/' ? 'nav-enter' : to === '/' ? 'nav-leave' : 'nav-persist';
    const root = document.documentElement;
    root.dataset.vt = kind;

    return new Promise((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
      const clear = () => {
        if (root.dataset.vt === kind) delete root.dataset.vt;
      };
      transition.finished.then(clear, clear);
    });
  });
</script>

<svelte:head>
  <link rel="preload" href="/assets/hero-bg.webp" as="image" type="image/webp" />
</svelte:head>

<SiteBackdrop />

{#if !isLanding}
  <header class="site-nav fixed inset-x-0 top-0 z-50">
    <Navbar />
  </header>
  <div class="backdrop-switch">
    <BackgroundSwitch />
  </div>
{/if}

<div class="page-stack">
  <main>
    <Transition url={data.url}>
      {@render children()}
    </Transition>
  </main>

  {#if !isLanding}
    <Footer />
  {/if}
</div>

<style>
  .backdrop-switch {
    position: fixed;
    z-index: 60;
    top: max(0.75rem, env(safe-area-inset-top));
    right: max(0.75rem, env(safe-area-inset-right));
  }

  @media (min-width: 640px) {
    .backdrop-switch {
      top: max(1.5rem, env(safe-area-inset-top));
      right: max(1.5rem, env(safe-area-inset-right));
    }
  }

  .page-stack {
    position: relative;
    z-index: 1;
  }
</style>
