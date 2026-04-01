<script lang="ts">
  import { formatDate } from '$lib/utils';
  import Metadata from '$lib/components/Metadata.svelte';
  let { data } = $props();
  import * as config from '$lib/config';
</script>

<Metadata
  title="My Blog"
  description="Welcome to my devblog where I post about my projects and ideas."
  url="/blog"
  image="/assets/thunderbirdfalls.webp"
  imageAlt="Thunderbird Falls - Alaska"
/>

<div
  class="hero h-[60vh] rounded-b-4xl bg-cover bg-bottom sm:bg-fixed sm:bg-center"
  style="background-image: url(/assets/thunderbirdfalls.webp);"
>
  <div class="hero-overlay rounded-b-4xl bg-black/60"></div>
  <div class="hero-content text-neutral-content pt-24 text-center">
    <div class="max-w-md">
      <h1 class="font-title mb-5 text-5xl font-bold">My Blog Posts</h1>
      <p class="font-main text-accent mb-5 text-xl">
        Check out some of my ideas, rants, and other cool things if you want to.
      </p>
    </div>
  </div>
</div>

<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
  <section>
    <div class="grid grid-cols-1 gap-8 pt-8 md:grid-cols-2 lg:grid-cols-3 lg:pt-10">
      {#each data.posts as post (post.slug)}
        <a
          href={post.slug}
          class="card bg-neutral border-secondary border-2 text-left shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <figure>
            <img
              class="h-56 w-full object-cover opacity-75"
              src={post.image || '/previews/spencer-glacier.webp'}
              alt={post.title}
            />
          </figure>
          <div class="card-body">
            <h2 class="card-title font-title">{post.title}</h2>
            <p class="text-sm opacity-70">{formatDate(post.date)}</p>
            <p class="text-base-content/80 mt-2">{post.description}</p>
          </div>
        </a>
      {/each}
    </div>
  </section>
</div>
