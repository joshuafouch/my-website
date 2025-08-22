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

<div class="px-4 pt-9 pb-16">

  <article class="prose lg:prose-xl prose-headings:font-title mx-auto break-words overflow-x-hidden">

    <header class="text-xl text-center font-title">
      <h1 class="pt-15">{data.meta.title}</h1>
      <p>{formatDate(data.meta.date)}</p>

      <div class="not-prose mt-8 mb-12 flex flex-wrap justify-center gap-4">
        {#each data.meta.categories as category (category)}
          <button class="btn btn-accent">&num;{category}</button>
        {/each}
      </div>

    </header>
    
    <div class="font-main">
      <data.content />
    </div>

  </article>
</div>
