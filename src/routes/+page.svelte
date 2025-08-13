<script>
  import Hero from '$lib/components/Hero.svelte';
  import { Alert } from 'flowbite-svelte';
</script>

<div class="min-h-screen flex flex-col bg-base-100">
  <main class="flex-grow flex items-center justify-center">
    <Hero />
  </main>
</div>

<div class="p-8">
  <Alert>
    <span class="font-medium">Info alert!</span>
    Change a few things up and try submitting again.
  </Alert>
</div>
