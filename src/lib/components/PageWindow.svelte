<script lang="ts">
  import { onDestroy } from 'svelte';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { backdrop, photoBackground } from '#lib/backdrop.svelte.ts';
  import { THEME_LABELS, theme, type ThemeMode } from '#lib/theme.svelte.ts';
  import { Typewriter } from '#lib/typewriter.svelte.ts';

  type Crumb = { text: string; href?: string };

  /** First path segments that are sections; any other single segment is a blog post (/<slug>). */
  const SECTIONS = new Set(['about', 'projects', 'blog', 'resume', 'admin']);

  const crumbs = $derived.by(() => {
    const parts = page.url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const trail: Crumb[] = [];

    if (parts.length === 1 && !SECTIONS.has(parts[0])) {
      trail.push({ text: 'blog', href: '/blog' }, { text: parts[0] });
    } else {
      parts.forEach((part, index) => {
        const last = index === parts.length - 1;
        trail.push({
          text: part,
          href: last ? undefined : `/${parts.slice(0, index + 1).join('/')}`
        });
      });
    }

    // A blog tag filter is a step deeper: ~ / blog / theology.
    const tag = page.url.pathname === '/blog' ? page.url.searchParams.get('tag') : null;
    if (tag) {
      trail[trail.length - 1].href = '/blog';
      trail.push({ text: tag });
    }
    return trail;
  });

  // The trail types itself out: from nothing when you arrive, and from the shared part when you
  // move between pages. Each crumb shows as much of "/text" as has been typed.
  const trailText = $derived(crumbs.map((crumb) => `/${crumb.text}`).join(''));
  const trail = new Typewriter();
  const typed = $derived.by(() => {
    // Only what matches the current trail counts, so a stale frame never shows the old path.
    let visible = 0;
    while (visible < trail.shown.length && trail.shown[visible] === trailText[visible]) visible++;
    let offset = 0;
    return crumbs.map((crumb) => {
      const length = crumb.text.length + 1;
      const count = Math.max(0, Math.min(length, visible - offset));
      offset += length;
      return { shown: count > 0, text: crumb.text.slice(0, Math.max(0, count - 1)) };
    });
  });

  // .pre: cut the trail before the new page paints, not a frame after.
  let arrived = false;
  $effect.pre(() => {
    const text = trailText;
    if (arrived) {
      trail.write(text);
      return;
    }
    arrived = true;
    trail.clear();
    // Arriving from the landing page, wait for the window to open (app.css, html[data-entrance]).
    trail.write(text, { delay: document.documentElement.dataset.entrance ? 380 : 300 });
  });

  // When you switch theme, its name types out, stays a second, and erases itself. The starting
  // theme is the one the page already has (app.html applies the saved one before the store is
  // restored), so restoring it on load does not count as a switch.
  const modes = Object.keys(THEME_LABELS) as ThemeMode[];
  const label = (mode: ThemeMode) => THEME_LABELS[mode].toLowerCase();
  const mode = new Typewriter('', 55);
  let lastMode: ThemeMode | null = null;
  $effect(() => {
    const current = theme.current;
    lastMode ??= modes.find((name) => document.documentElement.classList.contains(name)) ?? current;
    if (current === lastMode) return;
    lastMode = current;
    mode.clear();
    mode.write(label(current), { hold: 1000 });
  });

  onDestroy(() => {
    trail.stop();
    mode.stop();
  });

  // Arriving with a photo already chosen (switched on the landing page), show it straight away.
  // Only a switch made while this window is open fades from the old photo to the new one.
  const start = backdrop.index;
  let switched = $state(false);
  $effect(() => {
    if (backdrop.index !== start) switched = true;
  });
  const under = $derived(switched ? backdrop.previous : backdrop.index);
</script>

<!-- The landing page's photo, seen through a framed window: the visitor's chosen backdrop, toned
     Nord blue under the landing veil. Below it, a status line with where you are. -->
<div class="page-window">
  <div class="window">
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

    <nav class="status font-mono" aria-label="Breadcrumb">
      <div class="where">
        <ol class="trail">
          <li><a href={resolve('/')} aria-label="Home">~</a></li>
          {#each crumbs as crumb, index (index)}
            {#if typed[index]?.shown}
              <li>
                <span class="sep" aria-hidden="true">/</span>
                {#if crumb.href}
                  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- built from the current path -->
                  <a href={crumb.href} aria-label={crumb.text}>{typed[index].text}</a>
                {:else if typed[index].text}
                  <span class="here" aria-current="page">{typed[index].text}</span>
                {/if}
              </li>
            {/if}
          {/each}
        </ol>
        <span class="caret" class:typing={trail.busy} aria-hidden="true"></span>
      </div>
      <span class="mode" aria-live="polite">
        <span class="sr-only">{mode.busy ? label(theme.current) : ''}</span>
        <span aria-hidden="true">{mode.shown}</span><span
          class="caret small"
          class:typing={mode.busy && mode.shown !== ''}
          aria-hidden="true"
        ></span>
      </span>
    </nav>
  </div>
</div>

<style>
  .page-window {
    max-width: var(--page-width);
    margin-inline: auto;
    padding: 2.5rem 1.5rem 0;
  }

  .window {
    position: relative;
    border: 1px solid var(--border-strong);
    background: var(--mat);
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
    position: relative;
    height: 9.5rem;
    overflow: hidden;
    background: var(--ground);
  }

  .photo {
    position: absolute;
    inset: 0;
    background-position: center 42%;
    background-size: cover;
    filter: grayscale(1) contrast(1.1) brightness(0.92);
  }

  .photo.fade {
    opacity: 0;
    animation: window-photo-in 700ms ease forwards;
  }

  .tint {
    position: absolute;
    inset: 0;
    background: var(--tint);
    mix-blend-mode: color;
  }

  .veil {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, var(--win-in) 0%, var(--win-out) 80%);
  }

  @keyframes window-photo-in {
    to {
      opacity: 1;
    }
  }

  .status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 2.4rem;
    padding: 0 0.9rem;
    border-top: 1px solid var(--border-strong);
    color: var(--ink-faint);
    font-size: 0.8rem;
    letter-spacing: 0.02em;
  }

  .where {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .trail {
    display: flex;
    align-items: center;
    min-width: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
    list-style: none;
    white-space: nowrap;
  }

  .trail li {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .trail a {
    color: var(--ink-muted);
    text-decoration: none;
    background: linear-gradient(currentColor, currentColor) no-repeat left bottom / 0 1px;
    padding-bottom: 1px;
    transition:
      background-size 300ms ease,
      color 300ms ease;
  }

  .trail a:hover,
  .trail a:focus-visible {
    color: var(--ink-accent);
    background-size: 100% 1px;
    outline: none;
  }

  .sep {
    padding-inline: 0.45rem;
    opacity: 0.6;
  }

  .here {
    overflow: hidden;
    color: var(--ink);
    text-overflow: ellipsis;
  }

  .caret {
    flex: none;
    width: 0.45rem;
    height: 0.95rem;
    margin-left: 0.3rem;
    background: var(--ink-accent);
    animation: caret-blink 1.2s ease-in-out infinite;
  }

  /* Solid while it types, like a terminal cursor; it only blinks once it is waiting. */
  .caret.typing {
    opacity: 0.9;
    animation: none;
  }

  /* The theme name's cursor shows only while it types. */
  .caret.small {
    display: inline-block;
    width: 0.4rem;
    height: 0.85rem;
    margin-left: 0.2rem;
    vertical-align: -0.1rem;
    opacity: 0;
    animation: none;
  }

  .caret.small.typing {
    opacity: 0.9;
  }

  @keyframes caret-blink {
    0%,
    60%,
    100% {
      opacity: 0.15;
    }

    30% {
      opacity: 0.9;
    }
  }

  .mode {
    flex: none;
    min-width: 6.5rem;
    text-align: right;
    white-space: nowrap;
  }

  @media (max-width: 767px) {
    .page-window {
      /* Leaves room for the signature, which sits on the seam under the window (+layout). */
      padding: 1.4rem 1rem 1.6rem;
    }

    .view {
      height: 6rem;
    }

    .mode {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .photo.fade {
      opacity: 1;
      animation: none;
    }

    .caret {
      animation: none;
      opacity: 0.7;
    }
  }

  :global(html[data-motion='off']) .photo.fade {
    opacity: 1;
    animation: none;
  }
</style>
