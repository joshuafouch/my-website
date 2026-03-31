<script lang="ts">
  import { formatDate } from '$lib/utils';
  let { data } = $props();
  import * as config from '$lib/config';
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />

  <!-- Open Graph / Facebook -->
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="{config.url}/{data.meta.slug}" />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:image" content="{config.url}{data.meta.image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={data.meta.title} />
  <meta property="og:site_name" content="Joshua Fouch" />
  <meta property="og:locale" content="en_US" />

  <!-- Article metadata -->
  <meta property="article:published_time" content={data.meta.date} />
  <meta property="article:author" content="Joshua Fouch" />
  {#each data.meta.categories as category}
    <meta property="article:tag" content={category} />
  {/each}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="joshuafouch.vercel.app" />
  <meta property="twitter:url" content="{config.url}/{data.meta.slug}" />
  <meta name="twitter:title" content={data.meta.title} />
  <meta name="twitter:description" content={data.meta.description} />
  <meta name="twitter:image" content="{config.url}{data.meta.image}" />

  <!-- Canonical URL -->
  <link rel="canonical" href="{config.url}/{data.meta.slug}" />

  <!-- Structured Data (JSON-LD) -->
  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${data.meta.title}",
    "description": "${data.meta.description}",
    "image": "${config.url}${data.meta.image}",
    "datePublished": "${data.meta.date}",
    "author": {
      "@type": "Person",
      "name": "Joshua Fouch",
      "url": "${config.url}"
    },
    "publisher": {
      "@type": "Person",
      "name": "Joshua Fouch",
      "url": "${config.url}"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${config.url}/${data.meta.slug}"
    }
  }
  <\/script>`}
</svelte:head>

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
