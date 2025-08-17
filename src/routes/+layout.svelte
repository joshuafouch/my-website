<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import * as config from '$lib/config'

  let { children } = $props();
</script>

<svelte:head>
  <title>{config.title}</title>
  <link rel="preload" href="/assets/JF_logo_light.webp" as="image" type="image/webp">
  <link rel="preload" href="/assets/hero-bg.webp" as="image" type="image/webp">
</svelte:head>

<header class="fixed top-0 z-50 w-full p-4">
  <div class="max-w-6xl mx-auto">
    <Navbar />
  </div>
</header>

{@render children()}

<Footer />

