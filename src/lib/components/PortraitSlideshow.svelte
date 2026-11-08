<script lang="ts">
  import type { Portrait } from '#lib/about.ts';
  import { safeHref } from '#lib/links.ts';
  import { motion, reducedMotion } from '#lib/motion.svelte.ts';

  let {
    portraits = [],
    label = 'Portraits'
  }: {
    portraits?: Portrait[];
    label?: string;
  } = $props();

  let index = $state(0);
  let paused = $state(false);
  let root: HTMLDivElement | undefined = $state();
  /** All slides get their src; until then only the shown one does (see the effect below). */
  let loadAll = $state(false);
  /** On screen and in a visible tab: no point cycling (and repainting) when nobody can see it. */
  let inView = $state(true);
  let tabVisible = $state(true);

  const slides = $derived(
    portraits
      .map((portrait) => ({
        id: portrait.id,
        src: portrait.src.startsWith('blob:') ? portrait.src : safeHref(portrait.src),
        alt: portrait.alt || 'Joshua Fouch'
      }))
      .filter((portrait): portrait is { id: string; src: string; alt: string } =>
        Boolean(portrait.src)
      )
  );

  const current = $derived(slides[index] ?? slides[0] ?? null);
  const canCycle = $derived(slides.length > 1);
  const autoplay = $derived(
    canCycle && !paused && inView && tabVisible && !motion.off && !reducedMotion()
  );

  function clampIndex(next: number) {
    if (slides.length === 0) return 0;
    return ((next % slides.length) + slides.length) % slides.length;
  }

  function go(next: number) {
    loadAll = true;
    index = clampIndex(next);
  }

  function step(delta: 1 | -1) {
    go(index + delta);
  }

  $effect(() => {
    // Keep index valid when the set changes length.
    if (index >= slides.length) index = 0;
  });

  // The stacked slides would otherwise all download at once with the page. Fetch the rest when
  // the browser is idle, well before autoplay (5.5s) or a click needs them.
  $effect(() => {
    if (loadAll || !canCycle) return;
    const load = () => (loadAll = true);
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(load, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(load, 1000);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
    observer.observe(root);
    const onVisibility = () => (tabVisible = document.visibilityState === 'visible');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });

  $effect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      index = clampIndex(index + 1);
    }, 5500);
    return () => window.clearInterval(timer);
  });
</script>

{#if current}
  <div
    bind:this={root}
    class="slideshow"
    role="group"
    aria-roledescription="carousel"
    aria-label={label}
    onmouseenter={() => (paused = true)}
    onmouseleave={() => (paused = false)}
    onfocusin={() => (paused = true)}
    onfocusout={(event) => {
      if (!root?.contains(event.relatedTarget as Node | null)) paused = false;
    }}
  >
    <div class="mat">
      <div class="frame">
        {#each slides as slide, slideIndex (slide.id)}
          <button
            type="button"
            class="slide"
            class:active={slideIndex === index}
            aria-label={`Show portrait ${slideIndex + 1} of ${slides.length}`}
            aria-current={slideIndex === index ? 'true' : undefined}
            tabindex={slideIndex === index ? 0 : -1}
            onkeydown={(event) => {
              if (!canCycle) return;
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                step(1);
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                step(-1);
              }
            }}
            onclick={() => {
              if (slideIndex === index && canCycle) step(1);
              else go(slideIndex);
            }}
          >
            <img src={loadAll || slideIndex === index ? slide.src : undefined} alt={slide.alt} />
          </button>
        {/each}
      </div>
    </div>

    {#if canCycle}
      <div class="dots" role="tablist" aria-label="Choose portrait">
        {#each slides as slide, slideIndex (slide.id)}
          <button
            type="button"
            role="tab"
            class="dot"
            class:active={slideIndex === index}
            aria-label={`Portrait ${slideIndex + 1}`}
            aria-selected={slideIndex === index}
            onclick={() => go(slideIndex)}
          ></button>
        {/each}
      </div>
      <p class="sr-only" aria-live="polite">
        Portrait {index + 1} of {slides.length}
      </p>
    {/if}
  </div>
{/if}

<style>
  .slideshow {
    display: grid;
    gap: 0.75rem;
    justify-items: center;
  }

  /* A square portrait on the same mat as the site's other pictures. */
  .frame {
    position: relative;
    width: min(13rem, 64vw);
    aspect-ratio: 1;
  }

  .slide {
    position: absolute;
    inset: 0;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    overflow: hidden;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: opacity 900ms ease;
  }

  .slide.active {
    opacity: 1;
    pointer-events: auto;
    z-index: 1;
  }

  .slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* One short line per portrait; the shown one takes the accent. */
  .dots {
    display: flex;
    flex-wrap: wrap;
    gap: 0.15rem;
    justify-content: center;
  }

  .dot {
    width: 1.9rem;
    height: 1.4rem;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: linear-gradient(currentColor, currentColor) center / 1.4rem 1px no-repeat;
    color: var(--border-strong);
    cursor: pointer;
    transition: color 300ms ease;
  }

  .dot:hover {
    color: var(--ink-muted);
  }

  .dot.active {
    color: var(--ink-accent);
  }

  .dot:focus-visible {
    outline: 1px solid var(--ink-accent);
    outline-offset: 2px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .slide {
      transition: none;
    }
  }

  :global(html[data-motion='off']) .slide {
    transition: none;
  }
</style>
