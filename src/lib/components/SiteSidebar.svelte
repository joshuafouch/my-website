<script lang="ts">
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { links } from '#lib/config.ts';
  import { sidebar, toggleSidebar } from '#lib/sidebar.svelte.ts';
  import BackgroundSwitch from '#lib/components/BackgroundSwitch.svelte';

  let menu = $state(false);
  let narrow = $state(false);

  const pathname = $derived(page.url.pathname);
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

<aside
  class="rail font-serif"
  class:closed={!sidebar.open}
  class:expanded={menu}
  inert={!narrow && !sidebar.open}
>
  <div class="bar">
    <a class="mark" href={resolve('/')} aria-label="Home">
      <img src="/assets/jaf.svg" alt="" />
    </a>
    <button
      type="button"
      class="fold"
      aria-label="Hide sidebar"
      inert={!sidebar.open}
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
      onclick={() => (menu = !menu)}
    >
      {menu ? 'Close' : 'Menu'}
    </button>
  </div>

  <nav id="site-links" aria-label="Pages" inert={linksHidden}>
    <div class="sheet">
      <ul class="pages">
        {#each links as link (link.href)}
          <li>
            <a href={resolve(link.href)} aria-current={current(link.href) ? 'page' : undefined}>
              {link.text}
            </a>
          </li>
        {/each}
      </ul>

      <div class="dock">
        <div class="tools" role="group" aria-label="Appearance">
          <BackgroundSwitch compact />
          <button type="button" class="tool" aria-label="Color mode">
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
        <ul class="socials">
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

<button
  type="button"
  class="edge"
  class:shut={!sidebar.open}
  aria-label="Show sidebar"
  inert={sidebar.open}
  onclick={toggleSidebar}
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M9.5 6 15.5 12l-6 6"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</button>

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
    background: var(--nord1);
    border-right: 1px solid color-mix(in oklab, var(--nord4) 22%, transparent);
    transform: translateX(0);
    transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .rail.closed {
    transform: translateX(-100%);
  }

  .bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .mark {
    position: relative;
    display: grid;
    place-items: center;
    width: 3.4rem;
    height: 3.4rem;
    margin: 1.35rem;
    overflow: hidden;
    background: var(--nord6);
  }

  .mark img {
    width: 2.5rem;
    height: 2.5rem;
    max-width: none;
    object-fit: contain;
    transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .mark::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 32%,
      color-mix(in oklab, white 72%, transparent) 50%,
      transparent 68%
    );
    transform: translateX(-130%);
    pointer-events: none;
  }

  .mark:hover img,
  .mark:focus-visible img {
    transform: scale(1.06);
  }

  .mark:hover::after,
  .mark:focus-visible::after {
    animation: mark-shine 700ms ease;
  }

  .mark:focus-visible {
    outline: 1px solid var(--nord8);
    outline-offset: 3px;
  }

  .fold,
  .tool {
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: var(--ink-muted);
    cursor: pointer;
  }

  .fold {
    width: 2.25rem;
    height: 2.25rem;
    margin: 1.9rem 0.7rem 0 0;
  }

  .fold svg,
  .tool svg {
    width: 1rem;
    height: 1rem;
  }

  .fold:hover,
  .fold:focus-visible,
  .tool:hover,
  .tool:focus-visible {
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
  }

  .pages a[aria-current='page'],
  .pages a:hover,
  .pages a:focus-visible {
    color: var(--ink-accent);
    outline: none;
  }

  .dock {
    margin-top: auto;
    padding: 0.85rem 0 1.15rem;
    border-top: 1px solid color-mix(in oklab, var(--nord4) 18%, transparent);
  }

  .tools {
    display: flex;
    gap: 0.35rem;
    padding: 0 1rem 0.35rem;
  }

  .tool {
    width: 2rem;
    height: 2rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 35%, transparent);
    border-radius: 9999px;
  }

  .socials a {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 1.85rem;
    padding: 0.1rem 1.15rem;
    font-size: 0.95rem;
    font-variant: small-caps;
    letter-spacing: 0.08em;
    text-decoration: none;
  }

  .socials svg {
    width: 0.75rem;
    height: 0.75rem;
    fill: currentColor;
  }

  .edge {
    position: fixed;
    z-index: 45;
    top: 0;
    left: 0;
    display: none;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 0;
    border-right: 1px solid color-mix(in oklab, var(--nord4) 28%, transparent);
    border-bottom: 1px solid color-mix(in oklab, var(--nord4) 28%, transparent);
    background: var(--nord1);
    color: var(--ink-muted);
    cursor: pointer;
  }

  .edge.shut {
    display: grid;
  }

  .edge svg {
    width: 1rem;
    height: 1rem;
  }

  .edge:hover,
  .edge:focus-visible {
    color: var(--ink);
    outline: none;
  }

  @keyframes mark-shine {
    to {
      transform: translateX(130%);
    }
  }

  @media (max-width: 767px) {
    .rail,
    .rail.closed {
      right: 0;
      bottom: auto;
      width: 100%;
      height: auto;
      border-right: 0;
      border-bottom: 1px solid color-mix(in oklab, var(--nord4) 22%, transparent);
      transform: none;
    }

    .bar {
      align-items: center;
      height: 3.5rem;
      padding-right: 0.35rem;
    }

    .mark {
      width: 2.5rem;
      height: 2.5rem;
      margin: 0 0.85rem;
    }

    .mark img {
      width: 1.75rem;
      height: 1.75rem;
    }

    .fold {
      display: none;
    }

    .menu-btn {
      display: inline-flex;
      align-items: center;
      min-height: 2.75rem;
      padding: 0 0.85rem;
      border: 0;
      background: none;
      color: var(--ink-muted);
      font: inherit;
      font-variant: small-caps;
      letter-spacing: 0.12em;
      cursor: pointer;
    }

    .menu-btn:hover,
    .menu-btn:focus-visible {
      color: var(--ink-accent);
      outline: none;
    }

    nav {
      display: grid;
      flex: none;
      grid-template-rows: 0fr;
      transition: grid-template-rows 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .expanded nav {
      grid-template-rows: 1fr;
      border-top: 1px solid color-mix(in oklab, var(--nord4) 18%, transparent);
    }

    .sheet {
      display: block;
      overflow: hidden;
    }

    .expanded .sheet {
      padding-bottom: 0.85rem;
    }

    .dock {
      margin-top: 0.35rem;
    }

    .edge,
    .edge.shut {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rail,
    nav,
    .mark img {
      transition: none;
    }

    .mark::after {
      animation: none;
    }
  }
</style>
