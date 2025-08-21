<script lang="ts">
  import { formatDate } from '$lib/utils';
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta property="og:type" content="article" />
  <meta property="og:title" content={data.meta.title} />
</svelte:head>

<div class="px-4 pt-24 pb-16">

  <article class="prose lg:prose-xl prose-headings:font-title mx-auto">

    <header class="text-2xl text-center font-title">
      <h1 class="pt-15">{data.meta.title}</h1>
      <p>{formatDate(data.meta.date)}</p>

      <div class="not-prose mt-8 mb-12 flex flex-wrap justify-center gap-4">
        {#each data.meta.categories as category (category)}
          <span class="btn btn-accent">&num;{category}</span>
        {/each}
      </div>

    </header>
    
    <div class="font-main">
      <data.content />
    </div>

  </article>
</div>
