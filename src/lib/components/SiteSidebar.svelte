<script lang="ts">
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { links } from '#lib/config.ts';
  import { sidebar, toggleSidebar } from '#lib/sidebar.svelte.ts';
  import BackgroundSwitch from '#lib/components/BackgroundSwitch.svelte';
  import ThemeSwitch from '#lib/components/ThemeSwitch.svelte';
  import MotionToggle from '#lib/components/MotionToggle.svelte';
  import JafCrest from '#lib/components/JafCrest.svelte';
  import JafMark from '#lib/components/JafMark.svelte';

  let menu = $state(false);
  let narrow = $state(false);

  const pathname = $derived(page.url.pathname);
  const folded = $derived(!narrow && !sidebar.open);
  const linksHidden = $derived(narrow ? !menu : !sidebar.open);

  $effect(() => {
    if (pathname) menu = false;
  });

  onMount(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const sync = () => (narrow = query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  });

  function current(href: string) {
    if (href.startsWith('/about')) return pathname.startsWith('/about');
    return pathname === href;
  }
</script>

<aside class="rail font-serif" class:closed={!sidebar.open} class:expanded={menu}>
  <div class="bar">
    <a class="mark" href={resolve('/')} aria-label="Home" inert={folded}>
      <JafMark />
    </a>
    <button
      type="button"
      class="fold"
      aria-label={sidebar.open ? 'Hide sidebar' : 'Show sidebar'}
      aria-expanded={sidebar.open}
      aria-controls="site-links"
      onclick={toggleSidebar}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14.5 6 8.5 12l6 6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <button
      type="button"
      class="menu-btn"
      aria-expanded={menu}
      aria-controls="site-links"
      aria-label={menu ? 'Close' : 'Menu'}
      onclick={() => (menu = !menu)}
    >
      {#if menu}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6 6 18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      {/if}
    </button>
  </div>

  <div class="tools" role="group" aria-label="Appearance" inert={folded}>
    <BackgroundSwitch compact />
    <ThemeSwitch compact />
    <MotionToggle compact />
  </div>

  <nav id="site-links" aria-label="Pages">
    <div class="sheet">
      <ul class="pages" inert={linksHidden}>
        {#each links as link (link.href)}
          <li>
            <a href={resolve(link.href)} aria-current={current(link.href) ? 'page' : undefined}>
              {link.text}
            </a>
          </li>
        {/each}
      </ul>

      <div class="rail-foot">
        <div class="crest">
          <JafCrest />
        </div>
        <ul class="socials" inert={linksHidden}>
          <li>
            <a class="quiet-link" href={resolve('/resume')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 2h8.2L20 7.8V22H6V2z" />
              </svg>
              Resume
            </a>
          </li>
          <li>
            <a
              class="quiet-link"
              href="https://github.com/joshuafouch"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.022c-3.338.724-4.033-1.61-4.033-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.527.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.403c1.018.005 2.044.138 3.003.403 2.291-1.552 3.297-1.23 3.297-1.23.655 1.649.243 2.873.12 3.176.77.84 1.236 1.911 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.43.37.815 1.102.815 2.222v3.293c0 .321.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
              GitHub
            </a>
          </li>
          <li>
            <a
              class="quiet-link"
              href="https://www.linkedin.com/in/joshua-fouch12"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.762 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.867-3.063-1.867 0-2.154 1.459-2.154 2.969v5.698h-3v-10h2.881v1.367h.041c.401-.762 1.381-1.564 2.841-1.564 3.037 0 3.599 2.028 3.599 4.675v5.522z"
                />
              </svg>
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</aside>

<style>
  .rail {
    position: fixed;
    z-index: 40;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    width: var(--sidebar-width);
    overflow: hidden;
    background: var(--surface-raised);
    border-right: 1px solid var(--border-subtle);
    translate: 0 0;
    transition:
      translate var(--rail-speed) var(--ease-slide),
      background-color 250ms ease,
      border-color 250ms ease;
    will-change: translate;
  }

  .rail.closed {
    translate: calc(var(--rail-mini) - 100%) 0;
  }

  .mark,
  .tools,
  nav {
    transition: opacity 260ms ease 160ms;
  }

  .closed .mark,
  .closed .tools,
  .closed nav {
    opacity: 0;
    transition-delay: 0ms;
    transition-duration: 160ms;
  }

  .bar {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .mark {
    display: grid;
    place-items: center;
    width: 3.4rem;
    height: 3.4rem;
    margin: 1.35rem;
    color: var(--logo-outline, #242933);
    transition: color 250ms ease;
  }

  .mark :global(.jaf-mark) {
    width: 2.5rem;
    height: 2.5rem;
  }

  .mark:focus-visible {
    outline: 1px solid var(--nord8);
    outline-offset: 3px;
  }

  .fold,
  .menu-btn {
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: var(--ink-muted);
    cursor: pointer;
    transition: color 200ms ease;
  }

  .fold {
    position: absolute;
    top: 1.9rem;
    right: calc((var(--rail-mini) - 2.25rem) / 2);
    width: 2.25rem;
    height: 2.25rem;
  }

  .fold svg {
    transition: rotate var(--rail-speed) var(--ease-slide);
  }

  .closed .fold svg {
    rotate: 180deg;
  }

  .fold svg,
  .menu-btn svg {
    width: 1rem;
    height: 1rem;
  }

  .menu-btn svg {
    width: 1.15rem;
    height: 1.15rem;
  }

  .fold:hover,
  .fold:focus-visible,
  .menu-btn:hover,
  .menu-btn:focus-visible {
    color: var(--ink);
    outline: none;
  }

  .menu-btn {
    display: none;
  }

  nav {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .sheet {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .pages a {
    display: block;
    padding: 0.7rem 1.5rem;
    color: var(--ink-muted);
    font-size: 1.35rem;
    font-variant: small-caps;
    letter-spacing: 0.14em;
    text-decoration: none;
    transition:
      color 220ms ease,
      translate 320ms var(--ease-out);
  }

  .pages a:hover,
  .pages a:focus-visible {
    translate: 0.3rem 0;
  }

  .pages a[aria-current='page'],
  .pages a:hover,
  .pages a:focus-visible {
    color: var(--ink-accent);
    outline: none;
  }

  .rail-foot {
    position: relative;
    z-index: 1;
    margin-top: auto;
    padding: 3.15rem 0 1.2rem;
    border-top: 1px solid var(--border-subtle);
  }

  .crest {
    position: absolute;
    z-index: 0;
    left: 50%;
    bottom: 0;
    width: 14rem;
    pointer-events: none;
    opacity: 0.3;
    transform: translate(-50%, 50%);
  }

  .tools {
    position: absolute;
    z-index: 3;
    bottom: 8.15rem;
    left: 1rem;
    display: flex;
    gap: 0.35rem;
  }

  .socials {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
  }

  .socials a {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 2.25rem;
    padding: 0.1rem 1.35rem;
    font-size: 1.05rem;
    font-variant: small-caps;
    letter-spacing: 0.14em;
    text-decoration: none;
  }

  .socials svg {
    width: 1rem;
    height: 1rem;
    flex: none;
    fill: currentColor;
  }

  @media (max-width: 767px) {
    .rail,
    .rail.closed {
      right: 0;
      bottom: auto;
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      grid-template-rows: 3.5rem auto;
      align-items: center;
      width: 100%;
      height: auto;
      overflow: visible;
      border-right: 0;
      border-bottom: 1px solid var(--border-subtle);
      translate: none;
      will-change: auto;
    }

    .closed .mark,
    .closed .tools,
    .closed nav {
      opacity: 1;
    }

    .bar {
      display: contents;
    }

    .mark {
      grid-column: 1;
      grid-row: 1;
      width: 2.5rem;
      height: 2.5rem;
      margin: 0 0.85rem;
    }

    .mark :global(.jaf-mark) {
      width: 1.75rem;
      height: 1.75rem;
    }

    .fold {
      display: none;
    }

    .menu-btn {
      display: grid;
      grid-column: 4;
      grid-row: 1;
      width: 2.75rem;
      height: 2.75rem;
      padding: 0;
    }

    .tools {
      position: static;
      grid-column: 3;
      grid-row: 1;
      align-items: center;
      height: auto;
      margin: 0;
      padding-right: 0.15rem;
    }

    nav {
      display: grid;
      grid-column: 1 / -1;
      grid-row: 2;
      flex: none;
      grid-template-rows: 0fr;
      transition: grid-template-rows 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .expanded nav {
      grid-template-rows: 1fr;
      border-top: 1px solid var(--border-subtle);
    }

    .sheet {
      display: block;
      min-height: 0;
      overflow: hidden;
    }

    .expanded .sheet {
      padding-bottom: 0.85rem;
    }

    .rail-foot {
      margin-top: 0.35rem;
      padding: 0.35rem 0 0;
    }

    .crest {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rail,
    .mark,
    .tools,
    nav,
    .fold svg,
    .pages a {
      transition: none;
    }

    .pages a:hover,
    .pages a:focus-visible {
      translate: none;
    }
  }

  :global(html[data-motion='off']) .rail,
  :global(html[data-motion='off']) .mark,
  :global(html[data-motion='off']) .tools,
  :global(html[data-motion='off']) nav,
  :global(html[data-motion='off']) .fold svg,
  :global(html[data-motion='off']) .pages a {
    transition: none;
  }

  :global(html[data-motion='off']) .pages a:hover,
  :global(html[data-motion='off']) .pages a:focus-visible {
    translate: none;
  }
</style>
