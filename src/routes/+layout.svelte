<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { fade } from 'svelte/transition';
  import * as config from '$lib/config'
  let { children } = $props();
</script>

<svelte:head>
  <title>{config.title}</title>
  <link rel="preload" href="/assets/JF_logo_light.webp" as="image" type="image/webp">
  <link rel="preload" href="/assets/hero-bg.webp" as="image" type="image/webp">
</svelte:head>

<header class="">
  <Navbar />
</header>

<div transition:fade>
  {@render children()}
</div>

<Footer />

