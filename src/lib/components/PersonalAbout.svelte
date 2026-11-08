<script lang="ts">
  import { emptyLibrary, type MusicLibrary, type Portrait } from '#lib/about.ts';
  import AboutIntro from '#lib/components/AboutIntro.svelte';
  import MusicLibraryView from '#lib/components/MusicLibrary.svelte';
  import { safeHref, youtubeId } from '#lib/links.ts';

  let {
    introHtml = '',
    youtubeUrl = '',
    portraits = [],
    library = emptyLibrary()
  }: {
    introHtml?: string;
    youtubeUrl?: string;
    portraits?: Portrait[];
    library?: MusicLibrary;
  } = $props();

  const videoId = $derived(youtubeId(youtubeUrl));
  const videoHref = $derived(safeHref(youtubeUrl));
</script>

<div class="about-copy">
  <AboutIntro {introHtml} {portraits} side="end" label="Personal portraits" />

  <section
    class="rise block"
    class:after-intro={Boolean(introHtml || portraits.length)}
    style:--i={3}
  >
    <h2>Favorite music</h2>
    <MusicLibraryView {library} />
  </section>

  {#if videoId || videoHref}
    <section class="rise block" style:--i={4}>
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
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external URL -->
          <a class="quiet-link" href={videoHref} target="_blank" rel="noopener noreferrer">Watch</a>
        </p>
      {/if}
    </section>
  {/if}
</div>

<style>
  .block {
    margin-top: 4.5rem;
  }

  .block.after-intro {
    margin-top: 3rem;
  }

  h2 {
    margin: 0;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--border-strong);
    font-size: 2.4rem;
    font-weight: 500;
  }

  iframe {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin-top: 1.5rem;
    padding: 0.55rem;
    border: 1px solid var(--card-border);
    background: var(--mat);
    box-sizing: border-box;
  }
</style>
