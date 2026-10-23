<script lang="ts">
  import { onMount } from 'svelte';
  import { onNavigate } from '$app/navigation';
  import '../app.css';
  import Footer from '#lib/components/Footer.svelte';
  import Transition from '#lib/components/Transition.svelte';
  import SiteBackdrop from '#lib/components/SiteBackdrop.svelte';
  import SiteSidebar from '#lib/components/SiteSidebar.svelte';
  import SignatureLogo from '#lib/components/SignatureLogo.svelte';
  import { backdrop, photos, restoreBackdrop } from '#lib/backdrop.svelte.ts';
  import { restoreSidebar, sidebar } from '#lib/sidebar.svelte.ts';

  let { children, data } = $props();

  const isLanding = $derived(data.url === '/');
  let scrollY = $state(0);
  let signatureRun = $state(0);
  const showTop = $derived(scrollY > 280);

  function scrollUp() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  onMount(() => {
    restoreSidebar();
    return restoreBackdrop();
  });

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    const from = navigation.from?.url.pathname;
    const to = navigation.to?.url.pathname;
    if (!from || !to || from === to) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const kind = from === '/' ? 'nav-enter' : to === '/' ? 'nav-leave' : 'nav-persist';
    const root = document.documentElement;
    root.dataset.vt = kind;

    return new Promise((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
      const clear = () => {
        if (root.dataset.vt === kind) delete root.dataset.vt;
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
    <button
      type="button"
      class="watermark"
      aria-label="Replay signature"
      onclick={() => signatureRun++}
    >
      <div class="turn">
        {#key signatureRun}
          <SignatureLogo play instant={signatureRun === 0} />
        {/key}
      </div>
    </button>
    <div class="page-stack">
      <main>
        <div class="ridge" style:background-image="url('{photos[backdrop.index]}')"></div>
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
    min-height: 100svh;
    background: var(--nord0);
  }

  .page-stack {
    position: relative;
    z-index: 1;
  }

  .inner-shell .page-stack {
    margin-left: 0;
    transition: margin-left 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .sidebar-open .page-stack {
    margin-left: var(--sidebar-width);
  }

  .ridge {
    height: 11rem;
    background-color: var(--nord1);
    background-position: center 42%;
    background-size: cover;
  }

  .ridge::after {
    content: '';
    display: block;
    height: 100%;
    background: linear-gradient(transparent 35%, var(--nord0));
  }

  .watermark {
    position: fixed;
    z-index: 2;
    top: 0;
    right: 0;
    bottom: 0;
    display: block;
    width: 7.5rem;
    padding: 0;
    overflow: hidden;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .turn {
    --sig-length: 22rem;
    position: absolute;
    top: calc(var(--sig-length) / 2 + 0.35rem);
    left: 50%;
    width: var(--sig-length);
    color: var(--nord4);
    opacity: 0.16;
    transform: translate(-50%, -50%) rotate(90deg);
    animation: signature-drift 24s ease-in-out infinite;
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

  @keyframes signature-drift {
    0%,
    100% {
      color: var(--nord4);
      opacity: 0.14;
    }

    28% {
      color: var(--nord8);
      opacity: 0.22;
    }

    52% {
      color: var(--nord15);
      opacity: 0.16;
    }

    76% {
      color: var(--nord14);
      opacity: 0.2;
    }
  }

  @media (min-width: 768px) {
    .inner-shell .page-stack {
      padding-right: 7.5rem;
    }

    .ridge {
      margin-right: -7.5rem;
    }
  }

  @media (max-width: 767px) {
    .inner-shell .page-stack,
    .sidebar-open .page-stack {
      margin-left: 0;
      padding-top: 3.5rem;
    }

    .ridge {
      height: 7rem;
      margin-right: 0;
    }

    .watermark {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .inner-shell .page-stack {
      transition: none;
    }

    .turn {
      animation: none;
      color: var(--nord4);
      opacity: 0.16;
    }
  }
</style>
