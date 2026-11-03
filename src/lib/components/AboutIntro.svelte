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
  <header class="intro" class:flip={side === 'end'}>
    {#if portraits.length > 0}
      <div class="portraits">
        <PortraitSlideshow {portraits} {label} />
      </div>
    {/if}
    {#if introHtml}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- admin-authored markdown -->
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
    font-size: 1.25rem;
    line-height: 1.55;
  }

  .copy :global(p) + :global(p) {
    margin-top: 0.8rem;
  }

  @media (min-width: 640px) {
    .intro {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      text-align: left;
      gap: 1.75rem;
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
