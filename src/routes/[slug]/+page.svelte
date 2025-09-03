<script lang="ts">
  import { formatDate } from '$lib/utils';
  let { data } = $props();
  import * as config from '$lib/config';
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:type" content="article" />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:image" content="{config.url}{data.meta.image}" />
  <meta property="og:logo" content="{config.url}/favicon.png" />
</svelte:head>

<div
  class="hero min-h-[60vh] bg-cover bg-bottom sm:bg-fixed sm:bg-center rounded-b-4xl"
  style="background-image: url({data.meta.image || '/previews/spencer-glacier.webp'});"
>
  <div class="hero-overlay bg-black/60 rounded-b-4xl"></div>
  <div class="hero-content pt-24 text-center text-neutral-content">
    <div class="max-w-2xl">
      <h1 class="font-title mb-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
        {data.meta.title}
      </h1>
      <p class="mb-6 opacity-80">{formatDate(data.meta.date)}</p>
      <div class="flex flex-wrap justify-center gap-2">
        {#each data.meta.categories as category (category)}
          <div class="badge badge-secondary badge-outline">&num;{category}</div>
        {/each}
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
