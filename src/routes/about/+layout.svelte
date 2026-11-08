<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  let { children } = $props();

  const tabs = [
    { text: 'Professional', href: '/about/professional' },
    { text: 'Personal', href: '/about/personal' }
  ] as const;
</script>

<div class="about-shell font-serif">
  <h1 class="rise" style:--i={0}>About Me</h1>
  <nav class="about-tabs rise" style:--i={1} aria-label="About">
    <ul>
      {#each tabs as tab (tab.href)}
        <li>
          <a
            class="quiet-link"
            href={resolve(tab.href)}
            aria-current={page.url.pathname === tab.href ? 'page' : undefined}
          >
            {tab.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  {@render children()}
</div>

<style>
  .about-shell {
    max-width: var(--page-width);
    margin-inline: auto;
    padding: 2.25rem 1.5rem 3rem;
    color: var(--ink);
  }

  h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 500;
    line-height: 1;
  }

  .about-tabs {
    view-transition-name: about-tabs;
    margin: 1.5rem 0 2.75rem;
    border-top: 1px solid var(--border-strong);
    border-bottom: 1px solid var(--border-subtle);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0 1.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
    font-variant: small-caps;
    letter-spacing: 0.12em;
    font-size: 1.2rem;
  }

  li {
    display: flex;
    align-items: center;
    min-height: 2.8rem;
  }

  a[aria-current='page'] {
    color: var(--ink);
    background-image: linear-gradient(var(--ink-accent), var(--ink-accent));
    background-size: 100% 1px;
  }
</style>
