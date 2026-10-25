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
  <h1>About Me</h1>
  <nav class="about-tabs" aria-label="About">
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
    max-width: 46rem;
    margin-inline: auto;
    padding: 2.25rem 1.5rem 3rem;
    color: var(--ink);
  }

  h1 {
    margin: 0 0 1.1rem;
    font-size: clamp(2.4rem, 5vw, 3rem);
    font-weight: 500;
  }

  .about-tabs {
    view-transition-name: about-tabs;
    margin-bottom: 2.5rem;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
    font-variant: small-caps;
    letter-spacing: 0.14em;
    font-size: 1.35rem;
  }

  a[aria-current='page'] {
    color: var(--ink);
    background-size: 100% 1px;
  }
</style>
