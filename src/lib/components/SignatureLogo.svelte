<script lang="ts">
  import gsap from 'gsap';
  import logo from '#lib/assets/jaf-logo.svg?raw';
  import { reducedMotion } from '#lib/motion.svelte.ts';

  type Props = {
    /** Start writing. Hold false until a loader finishes. */
    play?: boolean;
    /** Show the finished signature instead of writing it. */
    instant?: boolean;
    /** Undraw the signature, last stroke first. */
    erase?: boolean;
    /** Drop the extra space under the mark. Used in the nav. */
    compact?: boolean;
    /** Cycle the ink through the same hues as the side signature. */
    drift?: boolean;
  };

  let {
    play = true,
    instant = false,
    erase = false,
    compact = false,
    drift = false
  }: Props = $props();

  let host: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!play) return;
    const svg = host?.querySelector('svg');
    if (!svg) return;

    const paths = [...svg.querySelectorAll('path')];
    const reduce = reducedMotion();
    const showFinished =
      (instant && !erase) ||
      (reduce && !erase) ||
      (!erase && paths.every((path) => path.style.opacity === '1'));

    if (showFinished) {
      for (const path of paths) path.style.opacity = '1';
      return;
    }

    if (erase) {
      if (reduce) {
        svg.style.opacity = '0';
        return;
      }
      const duration = 100;
      const started = performance.now();
      svg.style.opacity = '1';
      let timer = window.setTimeout(function step() {
        const t = Math.min(1, (performance.now() - started) / duration);
        svg.style.opacity = String(1 - t);
        if (t < 1) timer = window.setTimeout(step, 16);
      }, 16);
      return () => {
        window.clearTimeout(timer);
        svg.style.opacity = '';
      };
    }

    for (const path of paths) path.style.opacity = '0';

    let cursor = 0;
    const progress = { count: cursor };
    const tween = gsap.to(progress, {
      count: paths.length,
      duration: 1.35,
      ease: 'none',
      onUpdate() {
        const next = Math.floor(progress.count);
        for (let index = cursor; index < next; index++) paths[index].style.opacity = '1';
        cursor = next;
      },
      onComplete() {
        for (const path of paths) path.style.opacity = '1';
      }
    });

    return () => tween.kill();
  });
</script>

<div
  bind:this={host}
  class="signature"
  class:drift
  class:pb-2={!compact}
  class:shown={instant && !erase}
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- bundled SVG asset, not user input -->
  {@html logo}
</div>

<style>
  .signature :global(path) {
    opacity: 0;
    stroke: currentColor;
  }

  .shown :global(path) {
    opacity: 1;
  }

  /* Same hue stops as the side signature. Only the filter moves, so the
     compositor recolors the rasterized strokes without repainting them. */
  .drift {
    color: var(--nord8);
    isolation: isolate;
    animation: signature-color 24s ease-in-out infinite;
  }

  @keyframes signature-color {
    0% {
      filter: hue-rotate(0deg) saturate(0.25) brightness(1.15);
    }

    28% {
      filter: hue-rotate(0deg) saturate(1) brightness(1);
    }

    52% {
      filter: hue-rotate(118deg) saturate(1) brightness(1);
    }

    76% {
      filter: hue-rotate(259deg) saturate(1) brightness(1);
    }

    100% {
      filter: hue-rotate(360deg) saturate(0.25) brightness(1.15);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .signature :global(path) {
      opacity: 1;
    }

    .drift {
      animation: none;
      color: inherit;
      filter: none;
    }
  }

  :global(html[data-motion='off']) .signature :global(path) {
    opacity: 1;
  }

  :global(html[data-motion='off']) .drift {
    animation: none;
    color: inherit;
    filter: none;
  }
</style>
