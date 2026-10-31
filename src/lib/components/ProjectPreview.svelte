<script lang="ts">
  import { openLinks, safeHref } from '#lib/links.ts';
  import { renderMarkdown } from '#lib/markdown.ts';

  let {
    title,
    description = '',
    details = '',
    detailsHtml = '',
    image = '',
    images = [],
    tags = [],
    sourceUrl = ''
  }: {
    title: string;
    description?: string;
    details?: string;
    detailsHtml?: string;
    image?: string;
    images?: string[];
    tags?: string[];
    sourceUrl?: string;
  } = $props();

  let rendered = $state('');

  const pictures = $derived(
    [image, ...images].filter((src, index, all) => src && all.indexOf(src) === index)
  );
  const code = $derived(safeHref(sourceUrl));
  const html = $derived(detailsHtml || rendered);

  $effect(() => {
    if (detailsHtml) {
      rendered = '';
      return;
    }
    const source = details;
    let stale = false;
    void (async () => {
      const next = source.trim() ? openLinks(await renderMarkdown(source)) : '';
      if (!stale) rendered = next;
    })();
    return () => {
      stale = true;
    };
  });
</script>

<article class="font-serif">
  {#if pictures[0]}
    <img class="hero" src={pictures[0]} alt="" />
  {/if}
  <div class="sheet">
    <h2>{title || 'Untitled'}</h2>
    {#if description.trim()}
      <p class="lede">{description}</p>
    {/if}
    {#if html}
      <div class="details prose">{@html html}</div>
    {/if}
    {#if tags.length > 0}
      <p class="tags">{tags.join(' · ')}</p>
    {/if}
    {#if code}
      <p>
        <a class="quiet-link" href={code} target="_blank" rel="noopener noreferrer">Code</a>
      </p>
    {/if}
    {#if pictures.length > 1}
      <div class="gallery">
        {#each pictures.slice(1) as src (src)}
          <img {src} alt="" />
        {/each}
      </div>
    {/if}
  </div>
</article>

<style>
  .hero {
    display: block;
    width: 100%;
    height: 16rem;
    object-fit: cover;
  }

  .sheet {
    padding: 1.4rem 1.5rem 1.75rem;
  }

  h2 {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 500;
  }

  .lede,
  .details,
  .tags {
    color: var(--ink-muted);
  }

  .lede {
    margin: 0.8rem 0 0;
    font-size: 1.25rem;
    line-height: 1.5;
  }

  .details {
    margin: 1rem 0 0;
    font-size: 1.15rem;
    line-height: 1.6;
  }

  .details :global(p) {
    margin: 0 0 0.85rem;
  }

  .details :global(p:last-child) {
    margin-bottom: 0;
  }

  .details :global(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0.85rem 0;
  }

  .details :global(a) {
    color: var(--ink-accent);
  }

  .tags {
    margin: 0.8rem 0 0;
    font-variant: small-caps;
    letter-spacing: 0.08em;
  }

  .gallery {
    display: grid;
    gap: 0.85rem;
    margin-top: 1.35rem;
  }

  /* Keep natural aspect — these are usually page screenshots, not square crops. */
  .gallery img {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid var(--card-border);
    border-radius: 0.75rem;
    background: var(--surface-raised);
  }
</style>
