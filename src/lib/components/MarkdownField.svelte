<script lang="ts">
  import { highlightMarkdown } from '#lib/highlight-markdown.ts';

  let {
    value = $bindable(''),
    name,
    id,
    required = false,
    rows = 8
  }: {
    value?: string;
    name?: string;
    id?: string;
    required?: boolean;
    rows?: number;
  } = $props();

  let area = $state<HTMLTextAreaElement | null>(null);
  let backdrop = $state<HTMLPreElement | null>(null);

  const html = $derived(highlightMarkdown(value));
  const trailingBreak = $derived(value.endsWith('\n'));

  function syncScroll() {
    if (!area || !backdrop) return;
    backdrop.scrollTop = area.scrollTop;
    backdrop.scrollLeft = area.scrollLeft;
  }
</script>

<div class="md-field">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- highlightMarkdown escapes the source before adding spans -->
  <pre bind:this={backdrop} aria-hidden="true">{@html html}{#if trailingBreak}<br />{/if}</pre>
  <textarea bind:this={area} bind:value {id} {name} {required} {rows} onscroll={syncScroll}
  ></textarea>
</div>
