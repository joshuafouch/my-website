<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Transition from '$lib/components/Transition.svelte';
  // import { afterNavigate } from '$app/navigation';

  let { children, data } = $props();
</script>

<svelte:head>
  <link rel="preload" href="/assets/JF_logo_light.webp" as="image" type="image/webp" />
  <link rel="preload" href="/assets/hero-bg.webp" as="image" type="image/webp" />
</svelte:head>

<header class="fixed top-0 z-50 w-full">
  <div class="mx-auto max-w-6xl">
    <Navbar />
  </div>
</header>

<main>
  <Transition url={data.url}>
    {@render children()}
  </Transition>
</main>

<Footer />
