<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';

  type Props = {
    children: Snippet;
    url: string;
  };

  let { children, url }: Props = $props();

  function fallbackFade(node: Element) {
    const native = 'startViewTransition' in document;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return fade(node, { duration: native || reduce ? 0 : 250 });
  }
</script>

{#key url}
  <div class="transition" in:fallbackFade>
    {@render children?.()}
  </div>
{/key}

<style>
  .transition {
    height: 100%;
  }
</style>
