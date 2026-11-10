<script lang="ts">
  import { safeHref } from '#lib/links.ts';
  import { withInitial } from '#lib/initial.ts';

  // Takes finished, sanitized HTML: the project page renders it on the server
  // (projects/[slug]/+page.server.ts), the admin editor in the browser (#lib/markdown.ts).
  // Rendering here would ship marked and a sanitizer to every visitor.
  let {
    title,
    description = '',
    detailsHtml = '',
    image = '',
    images = [],
    tags = [],
    sourceUrl = '',
    date = '',
    compact = false
  }: {
    title: string;
    description?: string;
    detailsHtml?: string;
    image?: string;
    images?: string[];
    tags?: string[];
    sourceUrl?: string;
    date?: string;
    /** In the admin editor: a smaller heading and no page padding. */
    compact?: boolean;
  } = $props();

  const pictures = $derived(
    [image, ...images].filter((src, index, all) => src && all.indexOf(src) === index)
  );
  const code = $derived(safeHref(sourceUrl));
  const codeLabel = $derived(
    code ? code.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : ''
  );
  const year = $derived(/^\d{4}/.test(date) ? date.slice(0, 4) : '');
  const html = $derived(withInitial(detailsHtml));
</script>

<article class="project figures font-serif" class:compact>
  <header class="rise" style:--i={0}>
    <svelte:element this={compact ? 'h2' : 'h1'} class="title">{title || 'Untitled'}</svelte:element
    >
    {#if description.trim()}
      <p class="lede">{description}</p>
    {/if}
    {#if year || tags.length > 0 || code}
      <dl class="facts">
        {#if year}
          <div>
            <dt class="font-mono">year</dt>
            <dd>{year}</dd>
          </div>
        {/if}
        {#if tags.length > 0}
          <div>
            <dt class="font-mono">tags</dt>
            <dd class="tags">{tags.join(' · ')}</dd>
          </div>
        {/if}
        {#if code}
          <div>
            <dt class="font-mono">source</dt>
            <dd>
              <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external URL -->
              <a class="quiet-link" href={code} target="_blank" rel="noopener noreferrer"
                >{codeLabel}</a
              >
            </dd>
          </div>
        {/if}
      </dl>
    {/if}
  </header>

  {#if pictures[0]}
    <figure class="fig hero rise" style:--i={1}>
      <span class="mat"><img src={pictures[0]} alt="" fetchpriority="high" /></span>
      <figcaption class="font-mono"></figcaption>
    </figure>
  {/if}

  {#if html}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by renderMarkdown -->
    <div class="details prose rise" style:--i={2}>{@html html}</div>
  {/if}

  {#if pictures.length > 1}
    <div class="gallery">
      {#each pictures.slice(1) as src (src)}
        <figure class="fig">
          <span class="mat"><img {src} alt="" loading="lazy" /></span>
          <figcaption class="font-mono"></figcaption>
        </figure>
      {/each}
    </div>
  {/if}
</article>

<style>
  .project {
    color: var(--ink);
  }

  .title {
    margin: 0;
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 500;
    line-height: 1.04;
  }

  .compact .title {
    font-size: 2.2rem;
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

  .facts a {
    color: var(--ink-accent);
  }

  .fig {
    margin: 2.25rem 0 0;
  }

  .fig img {
    display: block;
    width: 100%;
    height: auto;
  }

  .hero img {
    aspect-ratio: 2 / 1;
    object-fit: cover;
  }

  figcaption {
    margin-top: 0.6rem;
    color: var(--ink-faint);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  .details {
    max-width: 40rem;
    margin-top: 2.75rem;
    color: var(--ink-muted);
    font-family: 'Source Serif 4', 'EB Garamond', Georgia, serif;
    font-size: 1.15rem;
    line-height: 1.75;
  }

  .details :global(h2),
  .details :global(h3) {
    margin: 2.5rem 0 0.6rem;
    color: var(--ink);
    font-family: 'DM Serif Text', serif;
    font-weight: 400;
  }

  .details :global(h2) {
    font-size: 1.75rem;
  }

  .details > :global(:first-child) {
    margin-top: 0;
  }

  .details :global(p) {
    margin: 0 0 1.25rem;
  }

  .details :global(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1.25rem 0;
    padding: 0.5rem;
    border: 1px solid var(--card-border);
    background: var(--mat);
  }

  .details :global(code) {
    color: var(--nord8);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9em;
  }

  .gallery {
    display: grid;
    gap: 0.5rem;
    margin-top: 1rem;
  }
</style>
