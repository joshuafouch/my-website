<script lang="ts">
  import { formatDate } from '#lib/utils.ts';
  import { withInitial } from '#lib/initial.ts';

  let {
    title,
    description = '',
    date,
    categories = [],
    image = '',
    html = '',
    compact = false
  }: {
    title: string;
    description?: string;
    date: string;
    categories?: string[];
    image?: string;
    html?: string;
    compact?: boolean;
  } = $props();

  const when = $derived(/^\d{4}-\d{2}-\d{2}/.test(date) ? formatDate(date.slice(0, 10)) : date);
  const tags = $derived(categories.map((category) => category.trim()).filter(Boolean));
  const body = $derived(withInitial(html));
</script>

<article class="post figures font-serif" class:compact>
  <header class="rise" style:--i={0}>
    <h1>{title || 'Untitled'}</h1>
    {#if description.trim()}
      <p class="lede">{description}</p>
    {/if}
    {#if when || tags.length > 0}
      <dl class="facts">
        {#if when}
          <div>
            <dt class="font-mono">posted</dt>
            <dd>{when}</dd>
          </div>
        {/if}
        {#if tags.length > 0}
          <div>
            <dt class="font-mono">tags</dt>
            <dd class="tags">{tags.join(' · ')}</dd>
          </div>
        {/if}
      </dl>
    {/if}
  </header>
  {#if image}
    <figure class="fig rise" style:--i={1}>
      <!-- The largest thing on a post page: fetch it ahead of scripts and other images. -->
      <span class="mat"><img src={image} alt="" fetchpriority="high" /></span>
      <figcaption class="font-mono"></figcaption>
    </figure>
  {/if}
  {#if body}
    <div class="body prose prose-invert font-reading rise max-w-none" style:--i={2}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by renderMarkdown -->
      {@html body}
    </div>
  {/if}
</article>

<style>
  .post {
    max-width: var(--page-width);
    margin-inline: auto;
    padding: 2.25rem 1.5rem 1rem;
    color: var(--ink);
  }

  .compact {
    padding: 0.25rem 1.5rem 2rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(2.3rem, 4.6vw, 3.2rem);
    font-weight: 500;
    line-height: 1.06;
  }

  .lede {
    max-width: 40rem;
    margin: 0.9rem 0 0;
    color: var(--ink-muted);
    font-size: 1.35rem;
    line-height: 1.45;
  }

  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 2rem;
    margin: 1.5rem 0 0;
    padding: 0.75rem 0;
    border-top: 1px solid var(--border-strong);
    border-bottom: 1px solid var(--border-subtle);
  }

  .facts div {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
  }

  dt {
    color: var(--ink-faint);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  dd {
    margin: 0;
    font-size: 1.12rem;
  }

  .tags {
    color: var(--ink-muted);
    font-variant: small-caps;
    letter-spacing: 0.1em;
  }

  .fig {
    margin: 2.25rem 0 0;
  }

  .fig img {
    display: block;
    width: 100%;
    max-height: 28rem;
    aspect-ratio: 2 / 1;
    object-fit: cover;
  }

  figcaption {
    margin-top: 0.6rem;
    color: var(--ink-faint);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  .body {
    max-width: 40rem;
    margin-top: 2.75rem;
    font-family: 'Source Serif 4', 'EB Garamond', Georgia, serif;
    font-size: 1.15rem;
    line-height: 1.75;
    --tw-prose-body: var(--ink-muted);
    --tw-prose-headings: var(--ink);
    --tw-prose-bold: var(--ink);
    --tw-prose-links: var(--ink-accent);
    --tw-prose-quotes: var(--ink-muted);
    --tw-prose-code: var(--nord8);
    --tw-prose-counters: var(--ink-muted);
    --tw-prose-bullets: var(--ink-muted);
  }

  .body :global(h1),
  .body :global(h2),
  .body :global(h3),
  .body :global(h4) {
    font-family: 'DM Serif Text', serif;
    font-weight: 400;
  }

  .body :global(code),
  .body :global(pre) {
    font-family: 'IBM Plex Mono', monospace;
  }

  /* Inline pictures sit on the same mat as the cover. */
  .body :global(img) {
    padding: 0.5rem;
    border: 1px solid var(--card-border);
    background: var(--mat);
  }

  /* Tailwind Typography's top margin would push the initial's paragraph down. */
  .body :global(.has-initial) {
    margin-top: 0;
  }
</style>
