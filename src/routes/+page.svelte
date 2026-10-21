<script lang="ts" module>
  /** True after the landing has finished loading once in this browser session. */
  let landingSeen = false;
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import Metadata from '#lib/components/Metadata.svelte';
  import SignatureLogo from '#lib/components/SignatureLogo.svelte';
  import { asset, resolve } from '$app/paths';

  const heroImage = '/assets/hero-bg.webp';

  const pages = [
    { text: 'About', href: resolve('/about') },
    { text: 'Blog', href: resolve('/blog') },
    { text: 'Projects', href: resolve('/projects') },
    { text: 'Resume', href: asset('assets/jf_resume26-27.pdf') }
  ];

  const socials = [
    { text: 'GitHub', href: 'https://github.com/joshuafouch' },
    { text: 'LinkedIn', href: 'https://www.linkedin.com/in/joshua-fouch12' }
  ];

  // A return visit already has the photo and fonts, so skip the loader.
  const returning = landingSeen;
  let ready = $state(landingSeen);
  let replay = $state(0);

  onMount(() => {
    if (landingSeen) return;

    const image = new Image();
    image.src = heroImage;
    const imageReady = image.decode().catch(() => undefined);
    const fontsReady = document.fonts.ready.then(() => undefined);
    const hold = new Promise<void>((resolve) => setTimeout(resolve, 900));
    const giveUp = new Promise<void>((resolve) => setTimeout(resolve, 3000));

    let cancelled = false;
    Promise.race([Promise.all([imageReady, fontsReady, hold]), giveUp]).then(() => {
      if (cancelled) return;
      landingSeen = true;
      ready = true;
    });
    return () => {
      cancelled = true;
    };
  });
</script>

<Metadata
  title="Joshua Fouch - Computer Science Student & Developer"
  description="Fourth-year Computer Science undergraduate at Franciscan University, focusing on networking, scripting, and web development. Explore my portfolio, projects, and blog."
  url="/"
  image={heroImage}
  imageAlt="Joshua Fouch's Portfolio"
/>

<svelte:head>
  <noscript>
    <style>
      .landing .reveal,
      .landing .backdrop {
        opacity: 1 !important;
      }
      .landing .loader {
        display: none;
      }
    </style>
  </noscript>
</svelte:head>

<section
  class="landing relative flex min-h-svh flex-col font-serif"
  class:is-ready={ready}
  class:is-return={returning}
>
  <div
    class="backdrop absolute inset-0 bg-cover bg-bottom sm:bg-center"
    style="background-image: url('{heroImage}');"
  ></div>
  <div class="veil absolute inset-0"></div>

  {#if !returning}
    <div class="loader absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <div class="flex flex-col items-center gap-6">
        <img src="/favicon.png" alt="" class="w-16" />
        <span class="ellipsis">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    </div>
  {/if}

  <div class="corner reveal" style="--step: 0">
    <button type="button" class="icon-btn" aria-label="Color mode">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>

  <div class="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
    <div class="logo w-full max-w-md" class:quick={returning && replay === 0}>
      <button
        type="button"
        class="signature-btn"
        aria-label="Replay signature"
        onclick={() => replay++}
      >
        {#key replay}
          <SignatureLogo play={ready} instant={returning && replay === 0} />
        {/key}
      </button>
    </div>

    <p class="hello reveal mt-4 max-w-md text-xl leading-relaxed sm:text-2xl" style="--step: 0">
      Hello! My name is <em class="name">Joshua Fouch</em>. Welcome to my corner of the web.
    </p>

    <nav aria-label="Pages" class="reveal mt-10" style="--step: 1">
      <ul class="pages flex flex-wrap items-center justify-center gap-y-1 text-base sm:text-xl">
        {#each pages as page, index (page.text)}
          {#if index > 0}
            <li aria-hidden="true" class="dot">·</li>
          {/if}
          <li><a class="link-line" href={page.href}>{page.text}</a></li>
        {/each}
      </ul>
    </nav>
  </div>

  <footer class="foot reveal text-center" style="--step: 2">
    <ul class="socials flex flex-wrap justify-center gap-x-8 text-sm">
      {#each socials as social (social.text)}
        <li>
          <a
            class="social-link link-line"
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {#if social.text === 'GitHub'}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.022c-3.338.724-4.033-1.61-4.033-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.527.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.403c1.018.005 2.044.138 3.003.403 2.291-1.552 3.297-1.23 3.297-1.23.655 1.649.243 2.873.12 3.176.77.84 1.236 1.911 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.43.37.815 1.102.815 2.222v3.293c0 .321.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.762 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.867-3.063-1.867 0-2.154 1.459-2.154 2.969v5.698h-3v-10h2.881v1.367h.041c.401-.762 1.381-1.564 2.841-1.564 3.037 0 3.599 2.028 3.599 4.675v5.522z"
                />
              </svg>
            {/if}
            {social.text}
          </a>
        </li>
      {/each}
    </ul>
    <a class="icon-btn admin" href={resolve('/admin/login')} aria-label="Admin login">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="7" cy="12" r="3.25" fill="none" stroke="currentColor" stroke-width="1.6" />
        <path
          d="M10.2 12H20M16 12v2.7M19.2 12v2.7"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </a>
  </footer>
</section>

<style>
  .landing {
    color: var(--ink);
    background-color: var(--ground);
  }

  .backdrop {
    opacity: 0;
    transition: opacity 600ms ease;
  }

  .is-ready .backdrop {
    opacity: 1;
  }

  .is-return .backdrop {
    transition: none;
  }

  .veil {
    background: radial-gradient(
      ellipse at center,
      color-mix(in oklab, var(--ground) 72%, transparent) 0%,
      color-mix(in oklab, var(--ground) 90%, transparent) 70%
    );
  }

  .corner {
    position: absolute;
    z-index: 2;
    top: max(0.75rem, env(safe-area-inset-top));
    right: max(0.75rem, env(safe-area-inset-right));
    display: flex;
    gap: 0.5rem;
  }

  .icon-btn {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 35%, transparent);
    border-radius: 9999px;
    background: color-mix(in oklab, var(--ground) 55%, transparent);
    color: var(--ink-muted);
    cursor: pointer;
  }

  .icon-btn svg {
    width: 1.05rem;
    height: 1.05rem;
  }

  .icon-btn:hover,
  .icon-btn:focus-visible {
    color: var(--ink);
    border-color: var(--nord4);
    outline: none;
  }

  .loader {
    z-index: 3;
    transition:
      opacity 400ms ease,
      visibility 0s linear 400ms;
  }

  .is-ready .loader {
    opacity: 0;
    visibility: hidden;
  }

  .ellipsis {
    display: flex;
    gap: 0.45rem;
  }

  .ellipsis span {
    width: 0.35rem;
    height: 0.35rem;
    border-radius: 9999px;
    background: var(--nord4);
    opacity: 0.15;
    animation: blink 1.2s ease-in-out infinite;
  }

  .ellipsis span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .ellipsis span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0%,
    60%,
    100% {
      opacity: 0.15;
    }
    30% {
      opacity: 0.9;
    }
  }

  .signature-btn {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
  }

  .signature-btn:focus-visible {
    outline: 1px solid var(--nord4);
    outline-offset: 6px;
  }

  .logo.quick {
    opacity: 0;
  }

  .is-ready .logo.quick {
    animation: rise 350ms ease both;
  }

  .reveal {
    opacity: 0;
  }

  .is-ready .reveal {
    animation: rise 700ms ease both;
    animation-delay: calc(200ms + var(--step) * 220ms);
  }

  .is-return .reveal {
    animation-duration: 350ms;
    animation-delay: 0ms;
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .hello {
    color: var(--ink-muted);
  }

  .name {
    color: var(--ink);
  }

  .pages {
    font-variant: small-caps;
    letter-spacing: 0.08em;
  }

  .pages a {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
  }

  .dot {
    padding-inline: 0.45rem;
    color: color-mix(in oklab, var(--nord4) 45%, transparent);
  }

  .foot {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    padding-inline: max(0.75rem, env(safe-area-inset-right));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .admin {
    grid-column: 3;
    justify-self: end;
  }

  .socials {
    grid-column: 2;
    column-gap: 1rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }

  .social-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2.75rem;
  }

  .social-link svg {
    width: 0.95rem;
    height: 0.95rem;
    fill: currentColor;
  }

  .link-line {
    background: linear-gradient(currentColor, currentColor) no-repeat left bottom / 0 1px;
    padding-bottom: 2px;
    transition:
      background-size 300ms ease,
      color 300ms ease;
  }

  .link-line:hover,
  .link-line:focus-visible {
    color: var(--ink-accent);
    background-size: 100% 1px;
    outline: none;
  }

  @media (max-width: 359px) {
    .socials {
      column-gap: 0.75rem;
      letter-spacing: 0.04em;
    }
  }

  @media (max-width: 399px) {
    .dot {
      display: none;
    }

    .pages {
      column-gap: 1.1rem;
      row-gap: 0.15rem;
    }
  }

  @media (min-width: 640px) {
    .corner {
      top: max(1.5rem, env(safe-area-inset-top));
      right: max(1.5rem, env(safe-area-inset-right));
    }

    .pages {
      letter-spacing: 0.12em;
    }

    .dot {
      padding-inline: 1.1rem;
    }

    .socials {
      column-gap: 2rem;
      letter-spacing: 0.18em;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .backdrop,
    .loader {
      transition: none;
    }

    .ellipsis span {
      animation: none;
      opacity: 0.9;
    }

    .is-ready .reveal,
    .is-ready .logo.quick {
      animation: none;
      opacity: 1;
    }
  }
</style>
