<script lang="ts">
  import raw from '../../../static/assets/jaf.svg?raw';

  // Outline takes currentColor; the red fill stays. Clip is dropped so a second copy can't steal it.
  const mark = raw
    .replaceAll('fill="#242933"', 'fill="currentColor"')
    .replace(/ clip-path="url\(#[^)]+\)"/, '');
</script>

<div class="jaf-mark" aria-hidden="true">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- bundled SVG asset, not user input -->
  {@html mark}
</div>

<style>
  .jaf-mark {
    color: inherit;
  }

  .jaf-mark :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
