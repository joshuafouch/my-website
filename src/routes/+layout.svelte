<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import '../app.css';
  // Same file app.css's @font-face uses, so this resolves to the identical hashed URL.
  import garamondRegular from '@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff2?url';
  import Footer from '#lib/components/Footer.svelte';
  import Transition from '#lib/components/Transition.svelte';
  import NightSky from '#lib/components/NightSky.svelte';
  import SiteSidebar from '#lib/components/SiteSidebar.svelte';
  import SignatureLogo from '#lib/components/SignatureLogo.svelte';
  import JafCrest from '#lib/components/JafCrest.svelte';
  import PageWindow from '#lib/components/PageWindow.svelte';
  import VercelObservability from '#lib/components/VercelObservability.svelte';
  import { restoreBackdrop } from '#lib/backdrop.svelte.ts';
  import { reducedMotion, restoreMotion } from '#lib/motion.svelte.ts';
  import { restoreSidebar, sidebar } from '#lib/sidebar.svelte.ts';
  import { restoreTheme, theme } from '#lib/theme.svelte.ts';

  let { children } = $props();

  const isLanding = $derived(page.url.pathname === '/');

  const transitionKey = $derived(page.url.pathname);
  let scrollY = $state(0);
  let signatureRun = $state(0);
  /** Bottom of the header window, from the top of the page: on phones the signature sits on the
      seam just under it. */
  let seamPx = $state(240);
  /** In-flight landing↔inner fade direction; used to detect quick reverses. */
  let activeLandingFade: 'inner' | 'landing' | null = null;
  const showTop = $derived(scrollY > 280);

  function measure() {
    const frame = document.querySelector('.page-window .window');
    const shell = document.querySelector('.inner-shell');
    if (!frame || !shell) return;
    seamPx = frame.getBoundingClientRect().bottom - shell.getBoundingClientRect().top;
  }

  afterNavigate(() => requestAnimationFrame(measure));

  function scrollUp() {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  onMount(() => {
    restoreTheme();
    restoreSidebar();
    restoreMotion();
    measure();
    window.addEventListener('resize', measure);
    const stopBackdrop = restoreBackdrop();

    // A tap on a landing link marks it straight away (the other links dim) while the next page's
    // data loads. The landing stays on screen until that data is in: fading it out on the tap left
    // a blank photo for as long as the request took.
    const markPending = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      if (window.location.pathname !== '/') return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank') return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname === '/') return;

      clearPending();
      pendingLink = anchor;
      anchor.dataset.pending = '';
      document.documentElement.dataset.pending = '';
      // A navigation that never lands (offline, cancelled) must not leave the links dimmed.
      pendingTimer = window.setTimeout(clearPending, 8000);
    };
    document.addEventListener('click', markPending, true);

    return () => {
      window.removeEventListener('resize', measure);
      document.removeEventListener('click', markPending, true);
      clearPending();
      stopBackdrop?.();
    };
  });

  let pendingLink: HTMLAnchorElement | null = null;
  let pendingTimer = 0;

  function clearPending() {
    window.clearTimeout(pendingTimer);
    if (pendingLink) delete pendingLink.dataset.pending;
    pendingLink = null;
    delete document.documentElement.dataset.pending;
  }

  afterNavigate(clearPending);

  /** Phones swap pages by hand: view transitions there fight the scroll reset and Safari's
      toolbar, and the snapshot jumps. */
  const narrowScreen = () => window.matchMedia('(max-width: 767px)').matches;

  onNavigate((navigation) => {
    if (reducedMotion()) return;
    const from = navigation.from?.url.pathname;
    const to = navigation.to?.url.pathname;
    if (!from || !to || from === to) return;

    const root = document.documentElement;

    // Landing includes the handwritten mark. Fade opacity instead of snapshotting it.
    if (from === '/' || to === '/') {
      const entering = from === '/' ? 'inner' : 'landing';
      const token = String(Date.now());
      const reversing = activeLandingFade !== null && activeLandingFade !== entering;
      activeLandingFade = entering;

      // The data is in by now (onNavigate runs after load), so the outgoing page fades and the
      // next one comes straight in, with no blank wait between them.
      root.dataset.fadeId = token;
      root.dataset.enter = entering;
      root.dataset.fade = 'out';

      return new Promise((resolve) => {
        let started = false;
        const go = () => {
          if (started) return;
          started = true;
          if (root.dataset.fadeId !== token) {
            resolve();
            return;
          }
          // Landing is a fixed viewport — reset scroll before the shell/landing DOM swap
          // so the ridge/sidebar geometry does not flash at a stale offset.
          if (entering === 'landing') window.scrollTo(0, 0);
          root.dataset.fade = 'in';
          // The longer, staged entrance into the inner pages (app.css, html[data-entrance]).
          if (entering === 'inner') {
            root.dataset.entrance = token;
            window.setTimeout(() => {
              if (root.dataset.entrance === token) delete root.dataset.entrance;
            }, 1900);
          } else {
            delete root.dataset.entrance;
          }
          resolve();
          const clearMs = entering === 'inner' ? 280 : 220;
          navigation.complete.finally(() => {
            window.setTimeout(() => {
              if (root.dataset.fadeId !== token) return;
              delete root.dataset.fade;
              delete root.dataset.fadeId;
              delete root.dataset.enter;
              if (activeLandingFade === entering) activeLandingFade = null;
            }, clearMs);
          });
        };

        // Quick reverse (into a page, then immediately back): skip waiting on the
        // interrupted enter animation so the shell never paints mid-translate.
        if (reversing) {
          requestAnimationFrame(go);
          return;
        }

        const outgoing =
          entering === 'inner'
            ? document.querySelector('.landing-chrome')
            : document.querySelector('.inner-shell');

        if (!(outgoing instanceof HTMLElement)) {
          go();
          return;
        }

        // Backstop in case animationend never fires (hidden tab, interrupted animation).
        const timer = window.setTimeout(go, 320);
        outgoing.addEventListener('animationend', function onEnd(event) {
          if (event.target !== outgoing) return;
          if (event.animationName !== 'page-fade-out' && event.animationName !== 'landing-leave')
            return;
          outgoing.removeEventListener('animationend', onEnd);
          window.clearTimeout(timer);
          go();
        });
      });
    }

    // Page → page: the new page's blocks rise in one after another (app.css, html[data-swap]).
    // 'after' means the old page has already faded out, so the rise starts without a lead-in.
    const token = String(Date.now());
    const swap = (mode: 'vt' | 'after') => {
      const value = `${mode}:${token}`;
      root.dataset.swap = value;
      window.setTimeout(() => {
        if (root.dataset.swap === value) delete root.dataset.swap;
      }, 1100);
    };

    if (!document.startViewTransition || narrowScreen()) {
      // Fade the old page out by hand, then swap while nothing is showing (the scroll reset to
      // the top happens out of sight).
      root.dataset.leaving = token;
      return new Promise((resolve) => {
        window.setTimeout(() => {
          swap('after');
          resolve();
          navigation.complete.finally(() => {
            if (root.dataset.leaving === token) delete root.dataset.leaving;
          });
        }, 150);
      });
    }

    root.dataset.vt = 'swap';
    root.dataset.vtId = token;

    return new Promise((resolve) => {
      const transition = document.startViewTransition(async () => {
        swap('vt');
        resolve();
        await navigation.complete;
      });
      const clear = () => {
        if (root.dataset.vtId !== token) return;
        delete root.dataset.vt;
        delete root.dataset.vtId;
      };
      transition.finished.then(clear, clear);
    });
  });
</script>

<svelte:head>
  <!-- The serif body face on every page. Found only after app.css is parsed otherwise, so the
       text renders in the fallback first and then swaps (layout shift). -->
  <link rel="preload" href={garamondRegular} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<svelte:window bind:scrollY />

<VercelObservability />

{#if isLanding}
  <!-- Solid edge strips for iOS Safari's bar colour (app.css .safari-edge). Keyed on the theme:
       Safari only re-reads the colour when the element at the edge is replaced. -->
  {#key theme.current}
    <div class="safari-edge top" aria-hidden="true"></div>
    <div class="safari-edge bottom" aria-hidden="true"></div>
  {/key}
  <div class="page-stack">
    <main>
      <Transition url={transitionKey}>
        {@render children()}
      </Transition>
    </main>
  </div>
{:else}
  <!-- The inner pages' background colour, as its own layer so the landing → inner enter can fade
       its opacity (composited) instead of animating background-color over the whole viewport
       (a full repaint every frame). A sibling, not a pseudo-element: isolating .inner-shell would
       trap the sidebar (z-index 40) under the back-to-top button (z-index 30). -->
  <div class="shell-surface" aria-hidden="true"></div>
  <div class="inner-shell" class:sidebar-open={sidebar.open} style:--seam-y={`${seamPx}px`}>
    <SiteSidebar />
    <div class="seam" aria-hidden="true"></div>
    <button
      type="button"
      class="watermark"
      aria-label="Replay signature"
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
      <!-- A faint aurora over the header window and stars in the margins (never behind text). -->
      <NightSky variant="inner" />
      <main>
        <PageWindow />
        <Transition url={transitionKey}>
          {@render children()}
        </Transition>
      </main>
      <Footer />
    </div>
  </div>
{/if}

<button
  class="to-top ticked"
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
    --sig-length: 90svh;
    --sig-thickness: calc(var(--sig-length) * 850.3 / 2857.14);
    --bar-height: 0px;
    position: relative;
    min-height: 100svh;
    overflow-x: clip;
  }

  /* Fixed and solid, so it looks the same as the shell's own background did. Positioned with
     z-index auto: paints after the backdrop photo and before the shell, like that background. */
  .shell-surface {
    position: fixed;
    inset: 0;
    background: var(--surface);
    pointer-events: none;
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
    color: var(--watermark-color);
    opacity: var(--watermark-opacity);
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

    /* Hidden behind the open sidebar: hold the drift instead of running a filter animation
       nobody sees. It resumes where it stopped. */
    .sidebar-open .watermark .turn {
      animation-play-state: paused;
    }
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
      filter: hue-rotate(0deg) saturate(var(--sig-end-saturate, 0.25))
        brightness(var(--sig-end-brightness, 1.15));
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
      filter: hue-rotate(360deg) saturate(var(--sig-end-saturate, 0.25))
        brightness(var(--sig-end-brightness, 1.15));
      opacity: 0.14;
    }
  }

  @media (max-width: 767px) {
    .inner-shell {
      --bar-height: 3.5rem;
    }

    .inner-shell .page-stack,
    .sidebar-open .page-stack {
      width: auto;
      translate: none;
      padding-top: var(--bar-height);
    }

    .watermark {
      position: absolute;
      top: calc(var(--seam-y) + 1.9rem);
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
      top: calc(var(--seam-y) + 1.9rem);
      right: 0;
      left: 0;
      display: block;
      height: 1px;
      pointer-events: none;
    }

    /* Two plain bars rather than currentColor gradients: Safari kept a stale (near-transparent)
       gradient colour after a theme change, so the line all but vanished. */
    .seam::before,
    .seam::after {
      content: '';
      position: absolute;
      top: 0;
      width: calc(50% - 3.6rem);
      height: 1px;
      background-color: var(--border-strong);
    }

    .seam::before {
      left: 0;
    }

    .seam::after {
      right: 0;
    }

    .turn {
      position: relative;
      top: auto;
      left: auto;
      width: 100%;
      color: var(--signature-rest, var(--ink-muted));
      opacity: 0.82;
      transform: none;
      animation: none;
    }

    .watermark:focus-visible .turn {
      opacity: 1;
    }

    /* Sits whole at the foot of the page, behind the footer, rather than fixed over the content. */
    .floor-crest {
      position: absolute;
      z-index: 0;
      bottom: env(safe-area-inset-bottom);
      left: 50%;
      display: block;
      width: 11rem;
      opacity: 0.22;
      pointer-events: none;
      transform: translateX(-50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .inner-shell .page-stack,
    .watermark {
      transition: none;
    }

    .turn {
      animation: none;
      color: var(--signature-rest, var(--nord4));
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

  :global(html[data-motion='off']) .turn {
    animation: none;
    color: var(--signature-rest, var(--nord4));
    opacity: 0.16;
  }

  @media (max-width: 767px) {
    :global(html[data-motion='off']) .turn {
      opacity: 0.82;
    }
  }
</style>
