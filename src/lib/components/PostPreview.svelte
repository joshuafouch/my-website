<script lang="ts">
  import { formatDate } from '#lib/utils.ts';

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
</script>

<article class="post font-serif" class:compact>
  <header>
    <h1>{title || 'Untitled'}</h1>
    {#if when}
      <p class="date">{when}</p>
    {/if}
    {#if tags.length > 0}
      <p class="tags">{tags.join(' · ')}</p>
    {/if}
    {#if description.trim()}
      <p class="lede">{description}</p>
    {/if}
  </header>
  {#if image}
    <img src={image} alt="" />
  {/if}
  {#if html}
    <div class="body prose prose-invert max-w-none">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- admin-authored markdown -->
      {@html html}
    </div>
  {/if}
</article>

<style>
  .post {
    max-width: 46rem;
    margin-inline: auto;
    padding: 2.25rem 1.5rem 3rem;
    color: var(--ink);
  }

  .compact {
    padding: 0.25rem 1.5rem 2rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(2.4rem, 5vw, 3.4rem);
    font-weight: 500;
    line-height: 1.05;
  }

  .date,
  .tags,
  .lede {
    color: var(--ink-muted);
  }

  .date,
  .tags {
    margin: 0.7rem 0 0;
    font-size: 1.05rem;
    letter-spacing: 0.06em;
  }

  .tags {
    font-variant: small-caps;
    letter-spacing: 0.12em;
  }

  .lede {
    margin: 1rem 0 0;
    font-size: 1.35rem;
    line-height: 1.45;
  }

  img {
    display: block;
    width: 100%;
    max-height: 28rem;
    margin-top: 1.75rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 28%, transparent);
    object-fit: cover;
  }

  .body {
    margin-top: 1.75rem;
    font-family: 'IBM Plex Sans', sans-serif;
    --tw-prose-body: var(--ink-muted);
    --tw-prose-headings: var(--ink);
    --tw-prose-bold: var(--ink);
    --tw-prose-links: var(--ink-accent);
    --tw-prose-quotes: var(--ink-muted);
    --tw-prose-code: var(--nord8);
    --tw-prose-counters: var(--ink-muted);
    --tw-prose-bullets: var(--ink-muted);
  }
</style>
