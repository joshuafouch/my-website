<script module lang="ts">
  // Path data + gsap for the write animation, fetched once and shared by every instance.
  let writer:
    Promise<[{ default: string }, { default: typeof import('gsap').default }]> | undefined;
  const loadWriter = () =>
    (writer ??= Promise.all([import('#lib/assets/jaf-logo.svg?raw'), import('gsap')]));
</script>

<script lang="ts">
  import { tick } from 'svelte';
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
  /** The 3,167-path inline SVG, loaded only while the write animation runs. */
  let markup: string | null = $state(null);
  /** The signature has been written; show the static (masked) copy. */
  let written = $state(false);

  // Start fetching as soon as a write is coming (e.g. during the landing loader), so the
  // animation starts on time even before `play` turns true.
  $effect(() => {
    if (!instant && !erase && !written && !reducedMotion()) void loadWriter();
  });

  $effect(() => {
    if (!play) return;
    const reduce = reducedMotion();

    if (erase) {
      const target = host?.firstElementChild as HTMLElement | null | undefined;
      if (!target) return;
      if (reduce) {
        target.style.opacity = '0';
        return;
      }
      const duration = 100;
      const started = performance.now();
      target.style.opacity = '1';
      let timer = window.setTimeout(function step() {
        const t = Math.min(1, (performance.now() - started) / duration);
        target.style.opacity = String(1 - t);
        if (t < 1) timer = window.setTimeout(step, 16);
      }, 16);
      return () => {
        window.clearTimeout(timer);
        target.style.opacity = '';
      };
    }

    if (instant || reduce || written) {
      if (!written) written = true;
      return;
    }

    // Write the signature stroke by stroke. The path data and gsap are fetched only now, so
    // pages that just show the finished signature never download or parse them.
    let cancelled = false;
    let stop: (() => void) | undefined;
    void (async () => {
      const [{ default: raw }, { default: gsap }] = await loadWriter();
      if (cancelled) return;
      markup = raw;
      await tick();
      const svg = host?.querySelector('svg');
      if (cancelled || !svg) return;

      const paths = [...svg.querySelectorAll('path')];
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
          // Finished: swap back to the static copy, which renders identically.
          written = true;
          markup = null;
        }
      });
      stop = () => tween.kill();
    })();

    return () => {
      cancelled = true;
      stop?.();
    };
  });
</script>

<div
  bind:this={host}
  class="signature"
  class:drift
  class:pb-2={!compact}
  class:shown={written || erase || (instant && !erase)}
>
  {#if markup}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- bundled SVG asset, not user input -->
    {@html markup}
  {:else}
    <div class="static" role="img" aria-label="Joshua Fouch"></div>
  {/if}
</div>

<style>
  .signature :global(path) {
    opacity: 0;
    stroke: currentColor;
  }

  /* The finished signature: jaf-logo.svg as a mask over currentColor. Same box as the inline
     SVG (width 100%, the viewBox's aspect ratio), so color, filters and layout are unchanged. */
  .static {
    display: block;
    width: 100%;
    aspect-ratio: 2857.14 / 850.3;
    background-color: currentColor;
    -webkit-mask: url('../assets/jaf-logo.svg') center / 100% 100% no-repeat;
    mask: url('../assets/jaf-logo.svg') center / 100% 100% no-repeat;
    opacity: 0;
  }

  .shown .static {
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
      filter: hue-rotate(0deg) saturate(var(--sig-end-saturate, 0.25))
        brightness(var(--sig-end-brightness, 1.15));
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
      filter: hue-rotate(360deg) saturate(var(--sig-end-saturate, 0.25))
        brightness(var(--sig-end-brightness, 1.15));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .signature :global(path),
    .static {
      opacity: 1;
    }

    .drift {
      animation: none;
      color: var(--signature-rest, inherit);
      filter: none;
    }
  }

  :global(html[data-motion='off']) .signature :global(path),
  :global(html[data-motion='off']) .static {
    opacity: 1;
  }

  :global(html[data-motion='off']) .drift {
    animation: none;
    color: var(--signature-rest, inherit);
    filter: none;
  }
</style>
