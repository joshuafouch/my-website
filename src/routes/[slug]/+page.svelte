<script lang="ts">
  import { resolve } from '$app/paths';
  import PostPreview from '#lib/components/PostPreview.svelte';
  import PageTurn from '#lib/components/PageTurn.svelte';
  import Metadata from '#lib/components/Metadata.svelte';

  let { data } = $props();

  const turn = (to: { title: string; slug: string } | null, label: string) =>
    to ? { label, title: to.title, href: resolve('/[slug]', { slug: to.slug }) } : null;
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

<div class="turn">
  <PageTurn
    label="More posts"
    previous={turn(data.earlier, 'earlier')}
    next={turn(data.later, 'later')}
  />
</div>

<style>
  .turn {
    max-width: var(--page-width);
    margin-inline: auto;
    padding: 0 1.5rem 3rem;
  }
</style>
