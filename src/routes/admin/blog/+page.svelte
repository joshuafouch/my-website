<script lang="ts">
  import { resolve } from '$app/paths';
  import { formatDate } from '#lib/utils.ts';

  let { data } = $props();
</script>

<svelte:head>
  <title>Blog posts</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Blog posts</h1>
    <p class="note">Drafts stay off the site until you publish them.</p>
  </div>
  <a class="solid" href={resolve('/admin/blog/new')}>New post</a>
</header>

{#if data.posts.length === 0}
  <p class="note">No posts yet.</p>
{:else}
  <ul class="index">
    {#each data.posts as post (post.id)}
      <li>
        <a
          class:has-image={Boolean(post.image)}
          href={resolve('/admin/blog/[slug]', { slug: post.slug })}
        >
          {#if post.image}
            <img src={post.image} alt="" />
          {/if}
          <span>
            <span class="name">{post.title}</span>
            <span class="meta"
              >{formatDate(post.date)} · {post.published ? 'Published' : 'Draft'}</span
            >
          </span>
        </a>
      </li>
    {/each}
  </ul>
{/if}
