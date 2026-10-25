<script lang="ts">
  import { onMount } from 'svelte';
  import { onNavigate } from '$app/navigation';
  import '../app.css';
  import Footer from '#lib/components/Footer.svelte';
  import Transition from '#lib/components/Transition.svelte';
  import SiteBackdrop from '#lib/components/SiteBackdrop.svelte';
  import SiteSidebar from '#lib/components/SiteSidebar.svelte';
  import SignatureLogo from '#lib/components/SignatureLogo.svelte';
  import JafCrest from '#lib/components/JafCrest.svelte';
  import { backdrop, photos, restoreBackdrop } from '#lib/backdrop.svelte.ts';
  import { reducedMotion, restoreMotion } from '#lib/motion.svelte.ts';
  import { restoreSidebar, sidebar } from '#lib/sidebar.svelte.ts';

  let { children, data } = $props();

  const isLanding = $derived(data.url === '/');
  let scrollY = $state(0);
  let signatureRun = $state(0);
  let ridgePx = $state(176);
  const showTop = $derived(scrollY > 280);
  const sigReveal = $derived(Math.min(1, Math.max(0, scrollY / (ridgePx || 1))));

  function scrollUp() {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  onMount(() => {
    restoreSidebar();
    restoreMotion();
    const measure = () => {
      const ridge = document.querySelector('.ridge');
      if (ridge) ridgePx = ridge.getBoundingClientRect().height;
    };
    measure();
    window.addEventListener('resize', measure);
    const stopBackdrop = restoreBackdrop();
    return () => {
      window.removeEventListener('resize', measure);
      stopBackdrop?.();
    };
  });

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    const from = navigation.from?.url.pathname;
    const to = navigation.to?.url.pathname;
    if (!from || !to || from === to) return;
    if (reducedMotion()) return;

    const root = document.documentElement;
    const token = String(Date.now());
    root.dataset.vt = from === '/' ? 'enter' : to === '/' ? 'leave' : 'swap';
    root.dataset.vtId = token;
    delete root.dataset.vtPhase;

    return new Promise((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
        // Only the incoming page gets its own layer; the outgoing one fades as part of the root.
        root.dataset.vtPhase = 'new';
      });
      const clear = () => {
        if (root.dataset.vtId !== token) return;
        delete root.dataset.vt;
        delete root.dataset.vtId;
        delete root.dataset.vtPhase;
      };
      transition.finished.then(clear, clear);
    });
  });
</script>

<svelte:head>
  <link rel="preload" href="/assets/hero-bg.webp" as="image" type="image/webp" />
</svelte:head>

<svelte:window bind:scrollY />

{#if isLanding}
  <SiteBackdrop />
{:else}
  <div class="inner-shell" class:sidebar-open={sidebar.open}>
    <SiteSidebar />
    <div class="seam" aria-hidden="true"></div>
    <button
      type="button"
      class="watermark"
      aria-label="Replay signature"
      style:--sig-reveal={sigReveal}
      onclick={() => signatureRun++}
    >
      <div class="turn">
        {#key signatureRun}
          <SignatureLogo play instant={signatureRun === 0} compact />
        {/key}
      </div>
    </button>
    <div class="floor-crest">
      <JafCrest />
    </div>
    <div class="page-stack">
      <main>
        <div class="ridge" aria-hidden="true">
          <div class="photo" style:background-image="url('{photos[backdrop.previous]}')"></div>
          {#key backdrop.index}
            <div
              class="photo"
              class:fade={backdrop.previous !== backdrop.index}
              style:background-image="url('{photos[backdrop.index]}')"
            ></div>
          {/key}
        </div>
        <Transition url={data.url}>
          {@render children()}
        </Transition>
      </main>
      <Footer />
    </div>
  </div>
{/if}

{#if isLanding}
  <div class="page-stack">
    <main>
      <Transition url={data.url}>
        {@render children()}
      </Transition>
    </main>
  </div>
{/if}

<button
  class="to-top"
  class:shown={showTop}
  type="button"
  aria-label="Back to top"
  aria-hidden={!showTop}
  tabindex={showTop ? 0 : -1}
  onclick={scrollUp}
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M6 14.5 12 8.5l6 6"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</button>

<style>
  .inner-shell {
    --ridge-height: 11rem;
    --sig-length: 100svh;
    --sig-thickness: calc(var(--sig-length) * 850.3 / 2857.14);
    --bar-height: 0px;
    position: relative;
    min-height: 100svh;
    overflow-x: clip;
    background: var(--nord0);
  }

  .page-stack {
    position: relative;
    z-index: 1;
  }

  /* Same width open or closed, so the sidebar only ever slides it (no reflow). */
  .inner-shell .page-stack {
    width: calc(100% - var(--sidebar-width));
    translate: var(--rail-mini) 0;
    transition: translate var(--rail-speed) var(--ease-slide);
  }

  .sidebar-open .page-stack {
    translate: var(--sidebar-width) 0;
  }

  .ridge {
    position: relative;
    height: var(--ridge-height);
    margin-right: calc(var(--sidebar-width) * -1);
    overflow: hidden;
    background-color: var(--nord1);
  }

  .ridge .photo {
    position: absolute;
    inset: 0;
    background-position: center 42%;
    background-size: cover;
  }

  .ridge .photo.fade {
    opacity: 0;
    animation: ridge-in 700ms ease forwards;
  }

  .ridge::after {
    content: '';
    position: absolute;
    z-index: 1;
    inset: 0;
    background: linear-gradient(transparent 35%, var(--nord0));
  }

  @keyframes ridge-in {
    to {
      opacity: 1;
    }
  }

  .floor-crest,
  .seam {
    display: none;
  }

  .watermark {
    position: fixed;
    z-index: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: block;
    width: var(--sig-thickness);
    padding: 0;
    overflow: visible;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    pointer-events: none;
    opacity: var(--sig-reveal, 0);
    transition:
      opacity 240ms ease,
      visibility 0s;
  }

  /* The signature is thousands of paths. Its drift animates filter and opacity
     only, which the compositor can run without repainting the SVG. */
  .turn {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--sig-length);
    color: var(--nord8);
    opacity: 0.16;
    transform: translate(-50%, -50%) rotate(-90deg);
    animation: signature-drift 24s ease-in-out infinite;
    pointer-events: none;
  }

  @media (min-width: 768px) {
    .sidebar-open .watermark {
      visibility: hidden;
      opacity: 0;
      transition:
        opacity 200ms ease,
        visibility 0s linear 200ms;
    }
  }

  .turn :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }

  .watermark:focus-visible {
    outline: none;
  }

  .watermark:focus-visible .turn {
    opacity: 0.34;
  }

  /* From nord8: desaturated reads as nord4, 118deg as nord15, 259deg as nord14. */
  @keyframes signature-drift {
    0% {
      filter: hue-rotate(0deg) saturate(0.25) brightness(1.15);
      opacity: 0.14;
    }

    28% {
      filter: hue-rotate(0deg) saturate(1) brightness(1);
      opacity: 0.22;
    }

    52% {
      filter: hue-rotate(118deg) saturate(1) brightness(1);
      opacity: 0.16;
    }

    76% {
      filter: hue-rotate(259deg) saturate(1) brightness(1);
      opacity: 0.2;
    }

    100% {
      filter: hue-rotate(360deg) saturate(0.25) brightness(1.15);
      opacity: 0.14;
    }
  }

  @media (max-width: 767px) {
    .inner-shell {
      --ridge-height: 7rem;
      --bar-height: 3.5rem;
    }

    .inner-shell .page-stack,
    .sidebar-open .page-stack {
      width: auto;
      translate: none;
      padding-top: var(--bar-height);
    }

    .ridge {
      margin-right: 0;
    }

    .watermark {
      position: absolute;
      top: calc(var(--bar-height) + var(--ridge-height));
      right: auto;
      bottom: auto;
      left: 50%;
      z-index: 2;
      width: 5.5rem;
      height: auto;
      transform: translate(-50%, -50%);
      pointer-events: auto;
      opacity: 1;
    }

    .seam {
      position: absolute;
      z-index: 2;
      top: calc(var(--bar-height) + var(--ridge-height));
      right: 0;
      left: 0;
      display: block;
      height: 1px;
      pointer-events: none;
      background:
        linear-gradient(currentColor, currentColor) left center / calc(50% - 3.6rem) 1px no-repeat,
        linear-gradient(currentColor, currentColor) right center / calc(50% - 3.6rem) 1px no-repeat;
      color: color-mix(in oklab, var(--nord4) 70%, transparent);
    }

    .turn {
      position: relative;
      top: auto;
      left: auto;
      width: 100%;
      color: var(--nord4);
      opacity: 0.82;
      transform: none;
      animation: none;
    }

    .watermark:focus-visible .turn {
      opacity: 1;
    }

    .floor-crest {
      position: fixed;
      z-index: 0;
      bottom: 0;
      left: 50%;
      display: block;
      width: 18rem;
      opacity: 0.22;
      pointer-events: none;
      transform: translate(-50%, 50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .inner-shell .page-stack,
    .watermark {
      transition: none;
    }

    .ridge .photo.fade {
      opacity: 1;
      animation: none;
    }

    .turn {
      animation: none;
      color: var(--nord4);
      opacity: 0.16;
    }
  }

  @media (max-width: 767px) and (prefers-reduced-motion: reduce) {
    .turn {
      opacity: 0.82;
    }
  }

  :global(html[data-motion='off']) .inner-shell .page-stack,
  :global(html[data-motion='off']) .watermark {
    transition: none;
  }

  :global(html[data-motion='off']) .ridge .photo.fade {
    opacity: 1;
    animation: none;
  }

  :global(html[data-motion='off']) .turn {
    animation: none;
    color: var(--nord4);
    opacity: 0.16;
  }

  @media (max-width: 767px) {
    :global(html[data-motion='off']) .turn {
      opacity: 0.82;
    }
  }
</style>
