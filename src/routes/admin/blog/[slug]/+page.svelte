<script lang="ts">
  import { resolve } from '$app/paths';
  import PostEditor from '#lib/components/PostEditor.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Edit post</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Edit post</h1>
    {#if data.saved}
      <p class="ok">Saved.</p>
    {/if}
  </div>
  <a class="quiet-link" href={resolve('/admin')}>All posts</a>
</header>

{#if data.post.published}
  <p class="note">
    <a class="quiet-link" href={resolve('/[slug]', { slug: data.post.slug })}>View on site</a>
  </p>
{/if}

<PostEditor post={data.post} {form} />
