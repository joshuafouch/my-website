<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import logo from '#lib/assets/jaf-logo.svg?raw';

  let host: HTMLDivElement | undefined = $state();

  onMount(() => {
    const svg = host?.querySelector('svg');
    if (!svg) return;

    const paths = [...svg.querySelectorAll('path')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      for (const path of paths) path.style.opacity = '1';
      return;
    }

    const progress = { count: 0 };
    let shown = 0;
    const play = gsap.to(progress, {
      count: paths.length,
        duration: 1.35,
      ease: 'none',
      onUpdate() {
        const next = Math.floor(progress.count);
        for (let index = shown; index < next; index++) paths[index].style.opacity = '1';
        shown = next;
      },
      onComplete() {
        for (const path of paths) path.style.opacity = '1';
      }
    });

    return () => play.kill();
  });
</script>

<div bind:this={host} class="signature pb-2">
  {@html logo}
</div>

<style>
  .signature :global(path) {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .signature :global(path) {
      opacity: 1;
    }
  }
</style>
