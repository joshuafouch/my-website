<script lang="ts">
  import type { Portrait } from '#lib/about.ts';
  import PortraitSlideshow from '#lib/components/PortraitSlideshow.svelte';

  let {
    introHtml = '',
    portraits = [],
    side = 'start',
    label = 'Portraits'
  }: {
    introHtml?: string;
    portraits?: Portrait[];
    /** `start` = portraits left / copy right. `end` = copy left / portraits right. */
    side?: 'start' | 'end';
    label?: string;
  } = $props();
</script>

{#if portraits.length > 0 || introHtml}
  <header class="intro rise" class:flip={side === 'end'} style:--i={2}>
    {#if portraits.length > 0}
      <div class="portraits">
        <PortraitSlideshow {portraits} {label} />
      </div>
    {/if}
    {#if introHtml}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by renderMarkdown -->
      <div class="copy">{@html introHtml}</div>
    {/if}
  </header>
{/if}

<style>
  .intro {
    display: grid;
    gap: 1.5rem;
    justify-items: center;
    text-align: center;
  }

  .portraits {
    display: grid;
    justify-items: center;
  }

  .copy :global(p) {
    margin: 0;
    color: var(--ink-muted);
    font-size: 1.35rem;
    line-height: 1.5;
  }

  .copy :global(a) {
    color: var(--ink);
    background-image: linear-gradient(var(--ink-accent), var(--ink-accent));
    background-size: 100% 1px;
  }

  .copy :global(a:hover),
  .copy :global(a:focus-visible) {
    color: var(--ink-accent);
  }

  .copy :global(p) + :global(p) {
    margin-top: 0.8rem;
  }

  @media (min-width: 640px) {
    .intro {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: flex-start;
      text-align: left;
      gap: 2.75rem;
    }

    .intro.flip {
      flex-direction: row-reverse;
    }

    .portraits {
      flex: 0 0 auto;
    }

    .copy {
      flex: 1;
      min-width: 0;
    }
  }
</style>
