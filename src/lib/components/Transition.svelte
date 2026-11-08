<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
    url: string;
  };

  let { children, url }: Props = $props();
</script>

<!-- The motion itself lives in +layout (onNavigate) and app.css: a view transition on desktop, a
     hand-made fade and rise on phones and in browsers without view transitions. -->
{#key url}
  <div class="transition">
    {@render children?.()}
  </div>
{/key}

<style>
  .transition {
    height: 100%;
  }
</style>
