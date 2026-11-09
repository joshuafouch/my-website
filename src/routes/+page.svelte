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
  import NightSky from '#lib/components/NightSky.svelte';
  import { backdrop, photoBackground, photos } from '#lib/backdrop.svelte.ts';
  import { resolve } from '$app/paths';
  import { preloadCode } from '$app/navigation';
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

  /** The terminal loader stays up long enough to type its command and fill its bar (CSS, below). */
  const LOADER_MIN_MS = 950;
  /** Never hold the page longer than this for the photo; the text doesn't need it. */
  const LOADER_MAX_MS = 1400;
  let loaderShown = $state(false);

  // Wait for the backdrop photo (the root layout decodes the visitor's saved one, preloaded by
  // app.html, and sets backdrop.revealed) and the loader's minimum time. Do not block on
  // document.fonts.ready — that waits for every face on the site and made the loader feel stuck.
  $effect(() => {
    if (backdrop.revealed && loaderShown) finishLoading();
  });

  // The window's photo: a switch made here fades from the old photo to the new one.
  const startPhoto = backdrop.index;
  let switched = $state(false);
  $effect(() => {
    if (backdrop.index !== startPhoto) switched = true;
  });
  const under = $derived(switched ? backdrop.previous : backdrop.index);

  // Fetch the three pages' code once the landing has settled, so a tap only waits on their data
  // (which the hover/touchstart preload starts). Saves a round trip on a phone's first visit.
  onMount(() => {
    const timer = setTimeout(() => {
      for (const id of ['/about/professional', '/projects', '/blog'] as const) {
        preloadCode(id).catch(() => {});
      }
    }, 1500);
    return () => clearTimeout(timer);
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
      .landing .reveal,
      .landing .window {
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
    <!-- A fake download in a full-screen terminal: the command types out, then a progress bar
         fills. Plain CSS, so it runs in the first paint, before hydration. -->
    <div class="loader" aria-hidden="true">
      <div class="term font-mono">
        <div>
          <span class="prompt">~ $ </span><span class="cmd">curl -sL https://joshuafouch.com</span>
        </div>
        <div class="progress">
          <span class="dim">[</span><span class="track"
            >--------------------<span class="fill">####################</span></span
          ><span class="dim">]</span> <span class="pct"></span><span class="caret"></span>
        </div>
      </div>
    </div>
  {/if}

  <NightSky variant="landing" />

  <div class="landing-chrome">
    <header class="top">
      <a class="home" href={resolve('/')} aria-label="Home">
        <img src="/favicon.png" alt="" width="30" height="30" />
      </a>
      <div class="corner reveal" style="--step: 0">
        <BackgroundSwitch />
        <ThemeSwitch />
        <MotionToggle />
      </div>
    </header>

    <div class="middle">
      <div class="window" class:quick={returning && replay === 0}>
        <div class="view" aria-hidden="true">
          <div class="photo" style:background-image={photoBackground(under)}></div>
          {#key backdrop.index}
            <div
              class="photo"
              class:fade={under !== backdrop.index}
              style:background-image={photoBackground(backdrop.index)}
            ></div>
          {/key}
          <div class="tint"></div>
          <div class="veil"></div>
        </div>
        <div class="sign">
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
      </div>

      <p class="hello reveal" style="--step: 1">
        Hello! My name is <em class="name">Joshua Fouch</em>. Welcome to my corner of the web.
      </p>

      <nav aria-label="Pages" class="reveal" style="--step: 2">
        <ul class="pages">
          {#each pages as page, index (page.text)}
            {#if index > 0}
              <li aria-hidden="true" class="dot">·</li>
            {/if}
            <li><a class="link-line" href={page.href}>{page.text}</a></li>
          {/each}
        </ul>
      </nav>
    </div>

    <footer class="foot reveal" style="--step: 3">
      <ul class="socials">
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
  @property --pct {
    syntax: '<integer>';
    inherits: false;
    initial-value: 0;
  }

  .landing {
    isolation: isolate;
    height: 100svh;
    height: 100dvh;
    overflow: hidden;
    /* No background of its own: the page's (--surface on html/body, app.css) shows through, so
       it fades in step with the Safari edge strips on a theme change. */
    color: var(--ink);
  }

  .landing-chrome {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: max(0.75rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
      max(0.5rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
  }

  /* ---- Loader: a full-screen terminal ---------------------------------------------------- */

  /* Visible in the first paint (a fade-in animation can't start until hydration frees the main
     thread, which held it invisible for ~0.5s), then fades out as the content rises in. */
  .loader {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: var(--ground);
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

  .term {
    color: var(--ink);
    font-size: 0.85rem;
    line-height: 1.9;
  }

  .prompt,
  .cmd,
  .track {
    white-space: pre;
  }

  .prompt {
    color: var(--ink-accent);
  }

  /* The command types out, a character a step. */
  .cmd {
    display: inline-block;
    width: 0;
    overflow: hidden;
    vertical-align: bottom;
    animation: type-cmd 330ms steps(32) 60ms forwards;
  }

  @keyframes type-cmd {
    to {
      width: 32ch;
    }
  }

  .progress {
    opacity: 0;
    animation: appear 0s 430ms forwards;
  }

  @keyframes appear {
    to {
      opacity: 1;
    }
  }

  .dim {
    color: var(--ink-faint);
  }

  .track {
    position: relative;
    display: inline-block;
    color: color-mix(in oklab, var(--ink-faint) 45%, transparent);
  }

  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 0;
    overflow: hidden;
    color: var(--ink-accent);
    animation: term-fill 440ms steps(20) 450ms forwards;
  }

  @keyframes term-fill {
    to {
      width: 20ch;
    }
  }

  .pct {
    counter-reset: pct var(--pct);
    animation: count 440ms steps(20) 450ms forwards;
  }

  .pct::after {
    content: counter(pct) '%';
  }

  @keyframes count {
    to {
      --pct: 100;
    }
  }

  .caret {
    display: inline-block;
    width: 0.55em;
    height: 1.05em;
    margin-left: 0.4em;
    vertical-align: -0.18em;
    background: var(--ink-accent);
    animation: blink 1.05s steps(1) infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  /* ---- Chrome ------------------------------------------------------------------------------ */

  .top {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .home {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    margin-left: -0.4rem;
    transition: transform 250ms var(--ease-out);
  }

  .home img {
    width: 1.85rem;
    height: 1.85rem;
  }

  .home:hover,
  .home:focus-visible {
    transform: scale(1.06);
    outline: none;
  }

  .corner {
    display: flex;
    gap: 0.2rem;
  }

  .middle {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    max-width: var(--page-width);
    min-height: 0;
    margin-inline: auto;
    padding-block: 0.75rem;
  }

  /* The photo, framed like the inner pages' header window, with the signature over it. */
  .window {
    position: relative;
    flex: 0 1 28rem;
    min-height: 10rem;
    border: 1px solid var(--border-strong);
    background: var(--ground);
    opacity: 0;
  }

  .window::before,
  .window::after {
    content: '';
    position: absolute;
    z-index: 2;
    width: 0.7rem;
    height: 0.7rem;
    border: 0 solid var(--border-strong);
  }

  .window::before {
    top: -0.45rem;
    left: -0.45rem;
    border-width: 1px 0 0 1px;
  }

  .window::after {
    right: -0.45rem;
    bottom: -0.45rem;
    border-width: 0 1px 1px 0;
  }

  .view {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .photo {
    position: absolute;
    inset: 0;
    background-position: center 62%;
    background-size: cover;
  }

  .photo.fade {
    opacity: 0;
    animation: window-photo-in 700ms ease forwards;
  }

  @keyframes window-photo-in {
    to {
      opacity: 1;
    }
  }

  .tint {
    position: absolute;
    inset: 0;
    background: var(--tint);
    mix-blend-mode: color;
    opacity: 0.35;
  }

  .veil {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, var(--veil-inner) 0%, var(--veil-outer) 75%);
  }

  .sign {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: 8%;
  }

  .signature-btn {
    display: block;
    width: min(36rem, 100%);
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

  .is-ready .window {
    animation: window-in 700ms var(--ease-out) both;
  }

  .is-ready .window.quick {
    animation: rise 200ms ease both;
  }

  @keyframes window-in {
    from {
      opacity: 0;
      transform: scale(0.985);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .reveal {
    opacity: 0;
  }

  .is-ready .reveal {
    animation: rise 600ms ease both;
    animation-delay: calc(160ms + var(--step) * 140ms);
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
    flex: none;
    max-width: 30ch;
    margin: 2.25rem auto 0;
    color: var(--ink-muted);
    font-size: 1.75rem;
    line-height: 1.35;
    text-align: center;
  }

  .name {
    color: var(--ink);
  }

  /* Back from an inner page (see fadedIn): that page has dissolved, and the window, then each
     row under it, rise back in one after another. */
  .faded-in.is-ready .window.quick {
    animation: return-rise 620ms var(--ease-out) 40ms both;
  }

  .faded-in.is-ready .reveal {
    animation: return-rise 560ms var(--ease-out) both;
    animation-delay: calc(160ms + var(--step) * 110ms);
  }

  @keyframes return-rise {
    from {
      opacity: 0;
      transform: translateY(0.9rem) scale(0.985);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  nav {
    flex: none;
    margin-top: 1.4rem;
  }

  .pages {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 1.35rem;
    font-variant: small-caps;
    letter-spacing: 0.12em;
  }

  .pages a {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
  }

  .dot {
    padding-inline: 1.1rem;
    color: color-mix(in oklab, var(--ink-muted) 55%, transparent);
  }

  .foot {
    flex: none;
  }

  /* IBM Plex Mono, lowercase: the same voice as the sidebar's links and the inner pages' trail. */
  .socials {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0 1.9rem;
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

  /* While the tapped page loads (+layout, html[data-pending]): it stays lit and underlined, and
     the other links step back, so the tap answers at once instead of the screen blanking. */
  .link-line:global([data-pending]) {
    color: var(--ink-accent);
    background-size: 100% 1px;
  }

  .social-link:global([data-pending]) .label {
    background-size: 100% 1px;
  }

  :global(html[data-pending]) .link-line:not(:global([data-pending])),
  :global(html[data-pending]) .dot {
    opacity: 0.35;
    transition: opacity 220ms ease;
  }

  @media (max-width: 767px) {
    .window {
      flex-basis: 19rem;
    }

    .hello {
      font-size: 1.35rem;
    }

    .pages {
      font-size: 1.15rem;
    }

    .dot {
      padding-inline: 0.6rem;
    }

    .term {
      font-size: 0.72rem;
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

  @media (prefers-reduced-motion: reduce) {
    .is-ready .loader {
      animation-duration: 1ms;
    }

    .cmd,
    .fill,
    .progress,
    .pct {
      animation-duration: 1ms;
      animation-delay: 0ms;
    }

    .caret {
      animation: none;
    }

    .is-ready .reveal,
    .is-ready .window,
    .faded-in.is-ready .reveal,
    .faded-in.is-ready .window.quick {
      animation: none;
      opacity: 1;
    }

    .photo.fade {
      animation-duration: 1ms;
    }
  }

  :global(html[data-motion='off']) .is-ready .loader {
    animation-duration: 1ms;
  }

  :global(html[data-motion='off']) .cmd,
  :global(html[data-motion='off']) .fill,
  :global(html[data-motion='off']) .progress,
  :global(html[data-motion='off']) .pct {
    animation-duration: 1ms;
    animation-delay: 0ms;
  }

  :global(html[data-motion='off']) .caret {
    animation: none;
  }

  :global(html[data-motion='off']) .is-ready .reveal,
  :global(html[data-motion='off']) .is-ready .window {
    animation: none;
    opacity: 1;
  }
</style>
