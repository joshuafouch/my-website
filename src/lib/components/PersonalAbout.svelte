<script lang="ts">
  import type { MusicEntry } from '#lib/about.ts';
  import { safeHref, youtubeId } from '#lib/links.ts';

  let {
    introHtml = '',
    youtubeUrl = '',
    music = []
  }: {
    introHtml?: string;
    youtubeUrl?: string;
    music?: MusicEntry[];
  } = $props();

  const videoId = $derived(youtubeId(youtubeUrl));
  const videoHref = $derived(safeHref(youtubeUrl));
</script>

<div class="about-copy">
  {#if introHtml}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- admin-authored markdown -->
    <div class="copy">{@html introHtml}</div>
  {/if}

  <section class="block">
    <h2>Favorite music</h2>
    {#if music.length > 0}
      <ul>
        {#each music as entry (entry.id)}
          {@const href = safeHref(entry.url)}
          <li>
            <p class="title">
              {#if href}
                <a class="quiet-link" {href} target="_blank" rel="noopener noreferrer"
                  >{entry.title}</a
                >
              {:else}
                {entry.title}
              {/if}
              {#if entry.artist}
                <span> · {entry.artist}</span>
              {/if}
            </p>
            {#if entry.note}
              <p class="note">{entry.note}</p>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if videoId || videoHref}
    <section class="block">
      <h2>Latest video</h2>
      {#if videoId}
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="Latest video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      {:else if videoHref}
        <p>
          <a class="quiet-link" href={videoHref} target="_blank" rel="noopener noreferrer">Watch</a>
        </p>
      {/if}
    </section>
  {/if}
</div>

<style>
  .copy :global(p),
  .note,
  .title {
    color: var(--ink-muted);
    font-size: 1.25rem;
    line-height: 1.55;
  }

  .copy :global(p) {
    margin: 0;
  }

  .copy :global(p) + :global(p) {
    margin-top: 0.8rem;
  }

  .block {
    margin-top: 4.5rem;
  }

  .copy + .block {
    margin-top: 3rem;
  }

  h2 {
    margin: 0;
    font-size: 2.4rem;
    font-weight: 500;
  }

  ul {
    display: grid;
    gap: 0.85rem;
    margin: 1.5rem 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding: 1.05rem 1.2rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 28%, transparent);
    background: color-mix(in oklab, var(--nord1) 72%, transparent);
  }

  .title {
    margin: 0;
    color: var(--ink);
  }

  .title span {
    color: var(--ink-muted);
  }

  .note {
    margin: 0.3rem 0 0;
    font-size: 1.15rem;
  }

  iframe {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin-top: 1.25rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 28%, transparent);
    background: color-mix(in oklab, var(--nord1) 72%, transparent);
  }
</style>
