<script lang="ts">
  import { resolve } from '$app/paths';
  import PostEditor from '#lib/components/PostEditor.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Edit post</title>
</svelte:head>

<div class="mb-6 flex items-center justify-between gap-4">
  <h1 class="font-title text-3xl font-bold">Edit post</h1>
  {#if data.post.published}
    <a class="btn btn-ghost btn-sm font-main" href={resolve('/[slug]', { slug: data.post.slug })}
      >View</a
    >
  {/if}
</div>

{#if data.saved}
  <p class="font-main text-success mb-4">Saved.</p>
{/if}

<PostEditor post={data.post} {form} />
