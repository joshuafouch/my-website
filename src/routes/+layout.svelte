<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Transition from '$lib/components/Transition.svelte';
  import * as config from '$lib/config';

  let { children, data } = $props();
</script>

<svelte:head>
  <title>{config.title}</title>
  <link rel="preload" href="/assets/JF_logo_light.webp" as="image" type="image/webp" />
  <link rel="preload" href="/assets/hero-bg.webp" as="image" type="image/webp" />
  <meta property="og:url" content={config.url}>
  <meta property="og:type" content="website">
  <meta property="og:title" content="Joshua Fouch's Portfolio">
  <meta property="og:description" content="Omnia ad Jesum per Mariam">
  <meta property="og:image" content="{config.url}/previews/spencer-glacier.webp">
  <meta property="og:logo" content="{config.url}/favicon.png" />

  <meta name="twitter:card" content="summary_large_image">
  <meta property="twitter:domain" content="joshuafouch.vercel.app">
  <meta property="twitter:url" content={config.url}>
  <meta name="twitter:title" content="Joshua Fouch's Portfolio">
  <meta name="twitter:description" content="Omnia ad Jesum per Mariam">
  <meta name="twitter:image" content="{config.url}/previews/spencer-glacier.webp">
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
