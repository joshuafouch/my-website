<script lang="ts">
  import { emptyLibrary, type MusicLibrary } from '#lib/about.ts';
  import MusicLibraryView from '#lib/components/MusicLibrary.svelte';
  import { safeHref, youtubeId } from '#lib/links.ts';

  let {
    introHtml = '',
    youtubeUrl = '',
    library = emptyLibrary()
  }: {
    introHtml?: string;
    youtubeUrl?: string;
    library?: MusicLibrary;
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
    <MusicLibraryView {library} />
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
  .copy :global(p) {
    margin: 0;
    color: var(--ink-muted);
    font-size: 1.25rem;
    line-height: 1.55;
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

  iframe {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin-top: 1.25rem;
    border: 1px solid var(--card-border);
    background: var(--card-bg);
  }
</style>
