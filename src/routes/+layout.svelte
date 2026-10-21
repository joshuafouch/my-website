<script lang="ts">
  import '../app.css';
  import Navbar from '#lib/components/Navbar.svelte';
  import Footer from '#lib/components/Footer.svelte';
  import Transition from '#lib/components/Transition.svelte';
  import { onNavigate } from '$app/navigation';

  let { children, data } = $props();

  const isLanding = $derived(data.url === '/');

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <link rel="preload" href="/assets/hero-bg.webp" as="image" type="image/webp" />
</svelte:head>

{#if !isLanding}
  <header class="site-nav fixed top-0 z-50 w-full">
    <div class="mx-auto max-w-6xl">
      <Navbar />
    </div>
  </header>
{/if}

<main>
  <Transition url={data.url}>
    {@render children()}
  </Transition>
</main>

{#if !isLanding}
  <Footer />
{/if}

<style>
  .site-nav {
    view-transition-name: site-nav;
  }
</style>
