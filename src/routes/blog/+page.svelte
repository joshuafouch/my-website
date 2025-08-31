<script lang="ts">
  import { formatDate } from '$lib/utils';
  let { data } = $props();
</script>

<svelte:head>
  <title>My Blog</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
  <section>
    <div class="lg:pt-10 pt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {#each data.posts as post (post.slug)}
        <div class="card bg-neutral text-left shadow-xl">
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

            <p class="mt-2 text-base-content/80">{post.description}</p>
            <div class="card-actions mt-4 justify-end">
              <a href={post.slug} class="btn btn-success">Read Post</a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>
