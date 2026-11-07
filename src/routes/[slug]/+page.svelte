<script lang="ts">
  import PostPreview from '#lib/components/PostPreview.svelte';
  import Metadata from '#lib/components/Metadata.svelte';

  let { data } = $props();
</script>

<Metadata
  title={data.meta.title}
  description={data.meta.description}
  url={`/${data.meta.slug}`}
  image={data.meta.image || '/assets/backgrounds/IMG_1797.webp'}
  imageAlt={data.meta.title}
  type="article"
  date={data.meta.date}
  author="Joshua Fouch"
  tags={data.meta.categories}
/>

<PostPreview
  title={data.meta.title}
  description={data.meta.description}
  date={data.meta.date}
  categories={data.meta.categories}
  image={data.meta.image}
  html={data.html}
/>
