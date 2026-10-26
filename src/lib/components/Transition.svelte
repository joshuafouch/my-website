<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import { reducedMotion } from '#lib/motion.svelte.ts';

  type Props = {
    children: Snippet;
    url: string;
  };

  let { children, url }: Props = $props();

  function fallbackFade(node: Element) {
    const native = 'startViewTransition' in document;
    const reduce = reducedMotion();
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
