<script lang="ts">
  import { resolve } from '$app/paths';
  import PostEditor from '#lib/components/PostEditor.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Admin</title>
</svelte:head>

<section>
  <h1 class="font-title mb-4 text-3xl font-bold">Posts</h1>
  {#if data.posts.length === 0}
    <p class="font-main opacity-70">No posts yet.</p>
  {:else}
    <ul class="space-y-3">
      {#each data.posts as post (post.id)}
        <li class="card bg-base-300 card-body flex-row items-center justify-between p-4">
          <div>
            <a class="font-title link" href={resolve('/admin/[slug]', { slug: post.slug })}
              >{post.title}</a
            >
            <p class="font-main text-sm opacity-70">{post.date}</p>
          </div>
          <span class="badge {post.published ? 'badge-success' : 'badge-ghost'}">
            {post.published ? 'Published' : 'Draft'}
          </span>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<h2 class="font-title mt-10 mb-6 text-2xl">New post</h2>
<PostEditor {form} />
