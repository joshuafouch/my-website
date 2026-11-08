<script lang="ts" module>
  /** True after the landing has finished loading once in this browser session. */
  let landingSeen = false;
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import Metadata from '#lib/components/Metadata.svelte';
  import SignatureLogo from '#lib/components/SignatureLogo.svelte';
  import BackgroundSwitch from '#lib/components/BackgroundSwitch.svelte';
  import ThemeSwitch from '#lib/components/ThemeSwitch.svelte';
  import MotionToggle from '#lib/components/MotionToggle.svelte';
  import { backdrop, photos } from '#lib/backdrop.svelte.ts';
  import { resolve } from '$app/paths';
  // The italic for the name in the greeting (the regular face is preloaded by the root layout).
  import garamondItalic from '@fontsource/eb-garamond/files/eb-garamond-latin-400-italic.woff2?url';

  const heroImage = photos[0];

  const pages = [
    // Straight to the page: /about itself is a redirect (an extra, uncached round trip).
    { text: 'About', href: resolve('/about/professional') },
    { text: 'Projects', href: resolve('/projects') },
    { text: 'Blog', href: resolve('/blog') }
  ];

  const socials = [
    { text: 'GitHub', href: 'https://github.com/joshuafouch' },
    { text: 'LinkedIn', href: 'https://www.linkedin.com/in/joshua-fouch12' }
  ];

  // A return visit already has the photo and fonts, so skip the loader.
  const returning = landingSeen;
  let ready = $state(landingSeen);
  let replay = $state(0);

  /** The layout's landing↔inner page fade is running (html[data-fade]); client-only. */
  const pageFading = () =>
    typeof document !== 'undefined' && document.documentElement.dataset.fade !== undefined;

  // When the page fade is what brings the content in, skip the rise animation. Decided once,
  // when the content is shown, and kept: tying it to html[data-fade] in CSS restarted the rise
  // (a visible jump) the moment the layout removed that attribute after the fade.
  let fadedIn = $state(returning && pageFading());

  function finishLoading() {
    if (ready) return;
    landingSeen = true;
    if (pageFading()) fadedIn = true;
    ready = true;
  }

  /** The JAF loader stays up at least this long after mount, so it reads as a beat, not a flash. */
  const LOADER_MIN_MS = 350;
  /** Never hold the page longer than this for the photo; the text doesn't need it. */
  const LOADER_MAX_MS = 900;
  let loaderShown = $state(false);

  // Wait for the backdrop photo (the root layout decodes the visitor's saved one, preloaded by
  // app.html, and sets backdrop.revealed) and the loader's minimum time. Do not block on
  // document.fonts.ready — that waits for every face on the site and made the loader feel stuck.
  $effect(() => {
    if (backdrop.revealed && loaderShown) finishLoading();
  });

  onMount(() => {
    if (landingSeen) return;
    const minimum = setTimeout(() => (loaderShown = true), LOADER_MIN_MS);
    const giveUp = setTimeout(finishLoading, LOADER_MAX_MS);
    return () => {
      clearTimeout(minimum);
      clearTimeout(giveUp);
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
  <link rel="preload" href={garamondItalic} as="font" type="font/woff2" crossorigin="anonymous" />
  <noscript>
    <style>
      .landing .reveal {
        opacity: 1 !important;
      }
      .landing .loader {
        display: none;
      }
    </style>
  </noscript>
</svelte:head>

<section
  class="landing relative flex flex-col font-serif"
  class:is-ready={ready}
  class:is-return={returning}
  class:faded-in={fadedIn}
>
  {#if !returning}
    <div class="loader absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <div class="flex flex-col items-center gap-6">
        <img src="/favicon.png" alt="" class="w-16" />
        <!-- A package-manager progress bar filling up. Plain CSS, so it runs in the first
             paint, before hydration. -->
        <span class="bar font-mono"
          >[<span class="track"
            >--------------------<span class="fill">####################</span></span
          >]</span
        >
      </div>
    </div>
  {/if}

  <div class="landing-chrome flex flex-1 flex-col">
    <div class="corner reveal" style="--step: 0">
      <BackgroundSwitch />
      <ThemeSwitch />
      <MotionToggle />
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
            <SignatureLogo play={ready} instant={returning && replay === 0} drift />
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
      <ul class="socials flex flex-wrap justify-center">
        <li>
          <a class="social-link link-line" href={resolve('/resume')}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M14 3.25H7.4c-.9 0-1.65.75-1.65 1.65v14.2c0 .9.75 1.65 1.65 1.65h9.2c.9 0 1.65-.75 1.65-1.65V8.15L14 3.25z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path
                d="M13.85 3.5V8.2H18.4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <path
                d="M8.6 12.15h6.8M8.6 15.15h6.8M8.6 18.1h4.15"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
            <span class="label">Resume</span>
          </a>
        </li>
        <!-- eslint-disable svelte/no-navigation-without-resolve -- external URL (socials are GitHub/LinkedIn) -->
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
              <span class="label">{social.text}</span><span class="out" aria-hidden="true">↗</span>
            </a>
          </li>
        {/each}
        <!-- eslint-enable svelte/no-navigation-without-resolve -->
      </ul>
    </footer>
  </div>
</section>

<style>
  .landing {
    color: var(--ink);
    min-height: 100svh;
    min-height: 100dvh;
    overflow: hidden;
  }

  .landing-chrome {
    min-height: 0;
  }

  .corner {
    position: absolute;
    z-index: 2;
    top: max(0.75rem, env(safe-area-inset-top));
    right: max(0.75rem, env(safe-area-inset-right));
    display: flex;
    gap: 0.2rem;
  }

  /* Visible in the first paint (a fade-in animation can't start until hydration frees the main
     thread, which held it invisible for ~0.5s), then fades out as the content rises in. */
  .loader {
    z-index: 3;
  }

  .is-ready .loader {
    animation: loader-out 400ms ease both;
  }

  @keyframes loader-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
      visibility: hidden;
    }
  }

  .bar {
    color: color-mix(in oklab, var(--nord4) 45%, transparent);
    font-size: 0.8rem;
    white-space: pre;
  }

  .track {
    position: relative;
    display: inline-block;
  }

  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 0;
    overflow: hidden;
    color: var(--nord4);
    animation: term-fill 800ms steps(20) 80ms forwards;
  }

  @keyframes term-fill {
    to {
      width: 20ch;
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
    animation: rise 200ms ease both;
  }

  .reveal {
    opacity: 0;
  }

  .is-ready .reveal {
    animation: rise 600ms ease both;
    animation-delay: calc(120ms + var(--step) * 160ms);
  }

  .is-return .reveal {
    animation-duration: 200ms;
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

  /* The page fade is the motion when arriving from another page (see fadedIn). */
  .faded-in.is-ready .reveal,
  .faded-in.is-ready .logo.quick {
    animation: none;
    opacity: 1;
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
    color: color-mix(in oklab, var(--ink-muted) 55%, transparent);
  }

  .foot {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    padding-inline: max(0.75rem, env(safe-area-inset-right));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  /* IBM Plex Mono, lowercase: the same voice as the sidebar's links and the inner pages' trail. */
  .socials {
    grid-column: 2;
    align-items: center;
    gap: 1.25rem 1.9rem;
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    text-transform: lowercase;
    color: var(--ink-muted);
  }

  .social-link {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 2.75rem;
    color: var(--ink-muted);
  }

  .social-link svg {
    width: 1.15rem;
    height: 1.15rem;
    fill: currentColor;
  }

  /* The underline sits under the word, not the icon. */
  .social-link.link-line {
    background: none;
  }

  .social-link .label {
    background: linear-gradient(currentColor, currentColor) no-repeat left bottom / 0 1px;
    padding-bottom: 2px;
    transition: background-size 300ms ease;
  }

  .social-link:hover .label,
  .social-link:focus-visible .label {
    background-size: 100% 1px;
  }

  .out {
    margin-left: -0.3rem;
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

  @media (max-width: 767px) {
    .landing {
      height: 100svh;
      height: 100dvh;
    }

    /* Pinned to the bottom edge, so the signature group centers in the full screen. */
    .foot {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-inline: max(1rem, env(safe-area-inset-left)) max(0.85rem, env(safe-area-inset-right));
      padding-bottom: max(0.55rem, env(safe-area-inset-bottom));
    }

    .socials {
      width: auto;
      flex-wrap: nowrap;
      justify-content: center;
      gap: 0.35rem 1.1rem;
      margin: 0;
      padding-inline: 0;
    }
  }

  @media (max-width: 520px) {
    .socials {
      gap: 0.25rem 0.8rem;
      letter-spacing: 0.02em;
      font-size: 0.74rem;
    }

    .social-link svg {
      width: 1rem;
      height: 1rem;
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
  }

  @media (prefers-reduced-motion: reduce) {
    .is-ready .loader {
      animation-duration: 1ms;
    }

    .fill {
      width: auto;
      animation: none;
    }

    .is-ready .reveal,
    .is-ready .logo.quick {
      animation: none;
      opacity: 1;
    }
  }

  :global(html[data-motion='off']) .is-ready .loader {
    animation-duration: 1ms;
  }

  :global(html[data-motion='off']) .fill {
    width: auto;
    animation: none;
  }

  :global(html[data-motion='off']) .is-ready .reveal,
  :global(html[data-motion='off']) .is-ready .logo.quick {
    animation: none;
    opacity: 1;
  }
</style>
