<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';

  const status = $derived(page.status);
  const notFound = $derived(status === 404);

  const title = $derived(
    notFound
      ? 'Page not found'
      : status === 401 || status === 403
        ? 'Not allowed here'
        : status >= 500
          ? 'Something went wrong'
          : 'That didn’t work'
  );

  const detail = $derived(
    notFound
      ? `There’s nothing at ${page.url.pathname}. It may have moved, or the link has a typo.`
      : status >= 500
        ? 'The site hit an error on its end. Try again in a moment.'
        : (page.error?.message ?? '')
  );

  const links = [
    { text: 'Home', href: resolve('/') },
    { text: 'Blog', href: resolve('/blog') },
    { text: 'Projects', href: resolve('/projects') }
  ];
</script>

<svelte:head>
  <title>{status} · {title}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="error-page font-serif">
  <p class="error-code" aria-hidden="true">{status}</p>
  <h1>{title}</h1>
  <p class="aside">sorry there, big guy…</p>
  {#if detail}
    <p class="detail">{detail}</p>
  {/if}

  <nav aria-label="Where to go instead">
    <ul>
      {#each links as link (link.href)}
        <li><a class="quiet-link" href={link.href}>{link.text}</a></li>
      {/each}
    </ul>
  </nav>
</section>

<style>
  .error-page {
    max-width: 46rem;
    margin-inline: auto;
    padding: 2.25rem 1.5rem 3rem;
    color: var(--ink);
  }

  .error-code {
    margin: 0;
    color: color-mix(in oklab, var(--ink-muted) 45%, transparent);
    font-size: clamp(4.5rem, 16vw, 7.5rem);
    font-weight: 500;
    line-height: 1;
    letter-spacing: 0.02em;
    font-variant-numeric: lining-nums;
  }

  h1 {
    margin: 0.5rem 0 0;
    font-size: 3rem;
    font-weight: 500;
    line-height: 1.1;
  }

  .aside {
    margin: 0.4rem 0 0;
    color: var(--ink-muted);
    font-size: 1.3rem;
    font-style: italic;
  }

  .detail {
    max-width: 34rem;
    margin: 1.5rem 0 0;
    color: var(--ink-muted);
    font-size: 1.2rem;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1.75rem;
    margin: 2.25rem 0 0;
    padding: 0;
    list-style: none;
    font-size: 1.15rem;
    font-variant: small-caps;
    letter-spacing: 0.08em;
  }

  ul a {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
  }
</style>
