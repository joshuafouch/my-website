<script lang="ts">
  import { links } from '#lib/config.ts';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import SignatureLogo from './SignatureLogo.svelte';

  let hidden = $state(false);
  let open = $state(false);
  let lastY = 0;

  const pathname = $derived(page.url.pathname);

  $effect(() => {
    if (!pathname) return;
    open = false;
    hidden = false;
    lastY = window.scrollY;
  });

  function onScroll() {
    const y = window.scrollY;
    hidden = y > lastY && y > 80;
    if (hidden) open = false;
    lastY = y;
  }

  function current(href: string) {
    if (href.startsWith('/about')) return pathname.startsWith('/about');
    return pathname === href;
  }
</script>

<svelte:window onscroll={onScroll} />

<div class="bar" class:tucked={hidden}>
  <div class="cluster font-serif">
    <div class="strip">
      <a class="home" href={resolve('/')} aria-label="Home">
        <SignatureLogo play instant compact />
      </a>

      <nav class="desktop" aria-label="Pages">
        <ul>
          {#each links as link (link.href)}
            <li>
              <a
                class="quiet-link"
                href={resolve(link.href)}
                aria-current={current(link.href) ? 'page' : undefined}
              >
                {link.text}
              </a>
            </li>
          {/each}
        </ul>
      </nav>

      <button
        type="button"
        class="menu-btn"
        aria-expanded={open}
        aria-controls="site-menu"
        onclick={() => (open = !open)}
      >
        {open ? 'Close' : 'Menu'}
      </button>
    </div>

    {#if open}
      <nav id="site-menu" class="mobile" aria-label="Pages">
        <ul>
          {#each links as link (link.href)}
            <li>
              <a href={resolve(link.href)} aria-current={current(link.href) ? 'page' : undefined}>
                {link.text}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}
  </div>
</div>

<style>
  .bar {
    padding: 0 0.75rem;
    transition: transform 400ms ease;
  }

  .bar.tucked {
    transform: translateY(calc(-100% - 1.25rem));
  }

  .cluster {
    width: max-content;
    max-width: min(52rem, 100%);
    margin-inline: auto;
  }

  .strip {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 3rem;
    padding: 0.45rem 1.15rem 0.55rem 0.9rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 28%, transparent);
    border-top: 0;
    border-radius: 0 0 1.35rem 1.35rem;
    background: color-mix(in oklab, var(--ground) 45%, transparent);
    backdrop-filter: blur(14px);
    box-shadow: 0 0.65rem 1.15rem -0.45rem color-mix(in oklab, var(--nord4) 62%, transparent);
    color: var(--ink);
  }

  .home {
    display: block;
    width: 8.5rem;
    color: var(--ink);
    transition: color 300ms ease;
  }

  .home:hover,
  .home:focus-visible {
    color: var(--ink-accent);
  }

  .home:focus-visible {
    outline: 1px solid var(--nord4);
    outline-offset: 4px;
  }

  .desktop {
    display: none;
  }

  .desktop ul,
  .mobile ul {
    display: flex;
    align-items: center;
    gap: 1.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
    font-variant: small-caps;
    letter-spacing: 0.1em;
    font-size: 1.05rem;
  }

  a[aria-current='page'] {
    color: var(--ink);
    background-size: 100% 1px;
  }

  .menu-btn {
    border: 0;
    background: none;
    color: var(--ink-muted);
    font: inherit;
    font-variant: small-caps;
    letter-spacing: 0.14em;
    cursor: pointer;
  }

  .menu-btn:hover,
  .menu-btn:focus-visible {
    color: var(--ink);
    outline: none;
  }

  .mobile {
    margin-top: 0.4rem;
    padding: 0.85rem 1.25rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 28%, transparent);
    border-radius: 1.25rem;
    background: var(--ground);
  }

  .mobile ul {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .mobile a {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    color: var(--ink-muted);
  }

  /* Keep the corner background control tappable without dropping it under the bar. */
  @media (max-width: 639px) {
    .bar {
      padding-right: calc(0.75rem + 2.75rem + 0.4rem);
    }
  }

  @media (min-width: 640px) {
    .desktop {
      display: block;
    }

    .menu-btn,
    .mobile {
      display: none;
    }
  }

  @media (min-width: 640px) and (max-width: 979px) {
    .bar {
      padding-right: calc(1.5rem + 2.75rem + 0.4rem);
    }

    .strip {
      gap: 1.75rem;
    }

    .desktop ul {
      gap: 1rem;
      letter-spacing: 0.06em;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .bar,
    .home {
      transition: none;
    }
  }
</style>
