<script>
  import Hero from '$lib/components/Hero.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
</script>

<div class="min-h-screen flex flex-col bg-base-100">
  <footer class="w-full py-4">
    <Navbar />
  </footer>

  <main class="flex-grow flex items-center justify-center">
    <Hero />
  </main>
</div>
