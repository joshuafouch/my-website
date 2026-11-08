<script module lang="ts">
  /** The signature as pen segments in writing order: x1, y1, x2, y2, width per segment. */
  type Strokes = { box: [number, number, number, number]; segments: Float32Array };

  // jaf-logo.svg is 3,167 one-segment paths. Parse them once, shared by every instance, and
  // draw them on a canvas: no 3,167-element SVG in the DOM, no per-path style writes.
  let writer: Promise<Strokes> | undefined;
  const loadWriter = () =>
    (writer ??= import('#lib/assets/jaf-logo.svg?raw').then(({ default: raw }) => {
      const box = raw
        .match(/viewBox="([^"]+)"/)![1]
        .split(/\s+/)
        .map(Number);
      const found = [...raw.matchAll(/d="M (\S+) (\S+) L (\S+) (\S+)" stroke-width="(\S+)"/g)];
      const segments = new Float32Array(found.length * 5);
      found.forEach((match, index) => {
        for (let field = 0; field < 5; field++) segments[index * 5 + field] = +match[field + 1];
      });
      return { box: box as Strokes['box'], segments };
    }));

  /** How long the signature takes to write, start to finish. */
  const WRITE_MS = 1350;
  /** A frame gap longer than this (e.g. a background tab) counts as LAG_STEP_MS, so the
      signature doesn't jump ahead when the page comes back. Same defaults as gsap's lagSmoothing. */
  const LAG_THRESHOLD_MS = 500;
  const LAG_STEP_MS = 33;
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
  /** Present only while the write animation runs. */
  let canvas: HTMLCanvasElement | undefined = $state();
  let writing = $state(false);
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

    // Write the signature stroke by stroke. The path data is fetched only now, so pages that
    // just show the finished signature never download or parse it.
    let cancelled = false;
    let stop: (() => void) | undefined;
    void (async () => {
      const { box, segments } = await loadWriter();
      if (cancelled) return;
      writing = true;
      await tick();
      if (cancelled) return;
      const context = canvas?.getContext('2d');
      // No canvas or no box to draw in: just show the finished signature.
      if (!canvas || !context || !canvas.clientWidth) {
        writing = false;
        written = true;
        return;
      }

      // Same box as the static copy: width 100%, the viewBox's aspect ratio.
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      const scale = canvas.width / box[2];
      context.setTransform(scale, 0, 0, scale, -box[0] * scale, -box[1] * scale);
      context.strokeStyle = getComputedStyle(canvas).color;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      const total = segments.length / 5;
      // Linear: draw up to floor(progress × strokes) each frame.
      let cursor = 0;
      let elapsed = 0;
      let last = performance.now();
      let frame = 0;
      const step = (now: number) => {
        // A rAF timestamp is the frame's start, which can be just before `last` was taken.
        const delta = Math.max(0, now - last);
        last = now;
        elapsed += delta > LAG_THRESHOLD_MS ? LAG_STEP_MS : delta;
        const progress = Math.min(1, elapsed / WRITE_MS);
        const next = Math.floor(progress * total);
        for (let index = cursor; index < next; index++) {
          const at = index * 5;
          context.beginPath();
          context.moveTo(segments[at], segments[at + 1]);
          context.lineTo(segments[at + 2], segments[at + 3]);
          context.lineWidth = segments[at + 4];
          context.stroke();
        }
        cursor = next;
        if (progress < 1) {
          frame = requestAnimationFrame(step);
          return;
        }
        // Finished: swap back to the static copy, which renders identically.
        written = true;
        writing = false;
      };
      frame = requestAnimationFrame(step);
      stop = () => cancelAnimationFrame(frame);
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
  {#if writing}
    <canvas bind:this={canvas} class="writer">Joshua Fouch</canvas>
  {:else}
    <div class="static" role="img" aria-label="Joshua Fouch"></div>
  {/if}
</div>

<style>
  /* The finished signature: jaf-logo.svg as a mask over currentColor. The canvas uses the same
     box (width 100%, the viewBox's aspect ratio), so color, filters and layout are unchanged. */
  .writer,
  .static {
    display: block;
    width: 100%;
    aspect-ratio: 2857.14 / 850.3;
  }

  .static {
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
    .static {
      opacity: 1;
    }

    .drift {
      animation: none;
      color: var(--signature-rest, inherit);
      filter: none;
    }
  }

  :global(html[data-motion='off']) .static {
    opacity: 1;
  }

  :global(html[data-motion='off']) .drift {
    animation: none;
    color: var(--signature-rest, inherit);
    filter: none;
  }
</style>
