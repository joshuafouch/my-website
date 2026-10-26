<script lang="ts">
  import { resolve } from '$app/paths';
  import PostEditor from '#lib/components/PostEditor.svelte';

  let { form } = $props();
</script>

<svelte:head>
  <title>New post</title>
</svelte:head>

<header class="head">
  <h1>New post</h1>
  <a class="quiet-link" href={resolve('/admin/blog')}>All posts</a>
</header>

<PostEditor {form} />
