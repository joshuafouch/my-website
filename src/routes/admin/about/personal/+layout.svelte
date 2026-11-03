<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  let { children } = $props();

  const links = [
    { href: resolve('/admin/about/personal/intro'), label: 'Introduction', key: 'intro' },
    { href: resolve('/admin/about/personal/portraits'), label: 'Portraits', key: 'portraits' }
  ];

  const current = $derived(
    links.find((link) => page.url.pathname.startsWith(link.href))?.key ?? ''
  );
</script>

<header class="head">
  <div>
    <h1>Personal</h1>
    <p class="note">Edit one section at a time. Saving updates the live about page.</p>
  </div>
  <a class="quiet-link" href={resolve('/about/personal')}>View on site</a>
</header>

<nav class="section-nav" aria-label="Personal sections">
  {#each links as link (link.key)}
    <a
      class="quiet-link"
      href={link.href}
      aria-current={current === link.key ? 'page' : undefined}>{link.label}</a
    >
  {/each}
</nav>

{@render children()}

<style>
  .section-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem 1.35rem;
    margin: 0 0 1.5rem;
    padding: 0 0 0.85rem;
    border-bottom: 1px solid color-mix(in oklab, var(--ink) 18%, transparent);
    font-size: 1.1rem;
    font-variant: small-caps;
    letter-spacing: 0.1em;
  }

  .section-nav a[aria-current='page'] {
    color: var(--ink-accent);
  }
</style>
