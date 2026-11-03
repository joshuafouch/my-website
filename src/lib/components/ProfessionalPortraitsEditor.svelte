<script lang="ts">
  import type { Portrait } from '#lib/about.ts';
  import PortraitsEditor from '#lib/components/PortraitsEditor.svelte';
  import type { BlogImage } from '#lib/types.ts';

  let {
    portraits = [],
    images = [],
    imageError = null,
    error = '',
    saved = false
  }: {
    portraits?: Portrait[];
    images?: BlogImage[];
    imageError?: string | null;
    error?: string;
    saved?: boolean;
  } = $props();
</script>

<PortraitsEditor
  kind="professional"
  {portraits}
  {images}
  {imageError}
  {error}
  {saved}
  note="Formal portraits for the professional about page. They rotate in a slow slideshow beside the introduction."
/>
