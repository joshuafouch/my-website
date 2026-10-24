<script lang="ts">
  import PostPreview from '#lib/components/PostPreview.svelte';
  import Metadata from '#lib/components/Metadata.svelte';
  import { formatDate } from '#lib/utils.ts';

  let { data } = $props();
</script>

<Metadata
  title={data.meta.title}
  description={data.meta.description}
  url={`/${data.meta.slug}`}
  image={data.meta.image || '/previews/spencer-glacier.webp'}
  imageAlt={data.meta.title}
  type="article"
  date={data.meta.date}
  author="Joshua Fouch"
  tags={data.meta.categories || data.meta.tags || []}
/>

{#if data.meta.type === 'post'}
  <PostPreview
    title={data.meta.title}
    description={data.meta.description}
    date={data.meta.date}
    categories={data.meta.categories}
    image={data.meta.image}
    html={data.html ?? ''}
  />
{:else}
  <header class="mx-auto max-w-2xl px-4 pt-8 pb-6 text-center font-serif">
    <h1 class="mb-4 text-4xl font-medium">{data.meta.title}</h1>
    <p class="opacity-80">{formatDate(data.meta.date)}</p>
  </header>

  <article class="prose prose-invert mx-auto px-4 py-8">
    {#if data.meta.image}
      <img class="mb-8 w-full" src={data.meta.image} alt={data.meta.title} />
    {/if}
    {#if data.html}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- admin-authored markdown -->
      {@html data.html}
    {:else if data.content}
      <data.content />
    {/if}
    {#if data.meta.type === 'project' && data.meta.sourceUrl}
      <p>
        <a href={data.meta.sourceUrl} target="_blank" rel="noopener noreferrer">Code</a>
      </p>
    {/if}
  </article>
{/if}
