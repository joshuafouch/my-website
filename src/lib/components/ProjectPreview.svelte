<script lang="ts">
  import { safeHref } from '#lib/links.ts';

  let {
    title,
    description = '',
    details = '',
    image = '',
    images = [],
    tags = [],
    sourceUrl = ''
  }: {
    title: string;
    description?: string;
    details?: string;
    image?: string;
    images?: string[];
    tags?: string[];
    sourceUrl?: string;
  } = $props();

  const pictures = $derived(
    [image, ...images].filter((src, index, all) => src && all.indexOf(src) === index)
  );
  const code = $derived(safeHref(sourceUrl));
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
    {#if details.trim()}
      <p class="details">{details}</p>
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
    white-space: pre-wrap;
  }

  .tags {
    margin: 0.8rem 0 0;
    font-variant: small-caps;
    letter-spacing: 0.08em;
  }

  .gallery {
    display: grid;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  .gallery img {
    width: 100%;
    height: 12rem;
    object-fit: cover;
  }
</style>
