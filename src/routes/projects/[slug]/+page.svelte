<script lang="ts">
  import Metadata from '#lib/components/Metadata.svelte';

  let { data } = $props();

  const cover = $derived(data.project.image || '/assets/backgrounds/IMG_1797.webp');
</script>

<Metadata
  title={data.project.title}
  description={data.project.description}
  url={`/projects/${data.project.slug}`}
  image={cover}
  imageAlt={data.project.title}
/>
