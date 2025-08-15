<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
  let { children } = $props();
</script>


<header class="font-title fixed top-0 z-50 w-full">
  <Navbar />
</header>

{@render children()}

<Footer />

