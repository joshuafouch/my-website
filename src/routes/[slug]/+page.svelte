<script lang="ts">
  import { formatDate } from '$lib/utils';
  import Metadata from '$lib/components/Metadata.svelte';
  let { data } = $props();
  import * as config from '$lib/config';
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

<div
  class="hero min-h-[60vh] rounded-b-4xl bg-cover bg-bottom sm:bg-fixed sm:bg-center"
  style="background-image: url({data.meta.image || '/previews/spencer-glacier.webp'});"
>
  <div class="hero-overlay rounded-b-4xl bg-black/60"></div>
  <div class="hero-content text-neutral-content pt-24 text-center">
    <div class="max-w-2xl">
      <h1 class="font-title mb-4 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
        {data.meta.title}
      </h1>
      <p class="mb-6 opacity-80">{formatDate(data.meta.date)}</p>
      <div class="flex flex-wrap justify-center gap-2">
        {#if data.meta.type === 'post'}
          {#each data.meta.categories as category (category)}
            <div class="badge badge-secondary badge-outline">&num;{category}</div>
          {/each}
        {:else if data.meta.type === 'project' && data.meta.tags}
          {#each data.meta.tags as tag (tag)}
            <div class="badge badge-secondary badge-outline">&num;{tag}</div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

<main class="bg-base-100 px-4 py-8">
  <article class="prose lg:prose-xl prose-headings:font-title mx-auto">
    <div class="font-main">
      <data.content />
    </div>
  </article>
</main>

{#if data.meta.type === 'project' && data.meta.sourceUrl}
  <a
    href={data.meta.sourceUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="btn btn-sm md:btn-lg btn-secondary fixed bottom-4 left-4 z-50 gap-2 opacity-70 shadow-lg transition-opacity hover:opacity-100"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 md:h-6 md:w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
      />
    </svg>
    <span class="font-title text-sm md:text-base">Code</span>
  </a>
{/if}
