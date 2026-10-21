<script lang="ts">
  import gsap from 'gsap';
  import logo from '#lib/assets/jaf-logo.svg?raw';

  type Props = {
    /** Start writing. Hold false until a loader finishes. */
    play?: boolean;
    /** Show the finished signature instead of writing it. */
    instant?: boolean;
  };

  let { play = true, instant = false }: Props = $props();

  let host: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!play) return;
    const svg = host?.querySelector('svg');
    if (!svg) return;

    const paths = [...svg.querySelectorAll('path')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showFinished = instant || reduce;

    if (showFinished) {
      for (const path of paths) path.style.opacity = '1';
      return;
    }

    for (const path of paths) path.style.opacity = '0';

    const progress = { count: 0 };
    let shown = 0;
    const tween = gsap.to(progress, {
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

    return () => tween.kill();
  });
</script>

<div bind:this={host} class="signature pb-2" class:shown={instant}>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- bundled SVG asset, not user input -->
  {@html logo}
</div>

<style>
  .signature :global(path) {
    opacity: 0;
  }

  .shown :global(path) {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .signature :global(path) {
      opacity: 1;
    }
  }
</style>
