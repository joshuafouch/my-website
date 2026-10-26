<script lang="ts">
  import { formatDate } from '#lib/utils.ts';
  import Metadata from '#lib/components/Metadata.svelte';
  import { resolve } from '$app/paths';

  let { data } = $props();

  let query = $state('');
  let tag = $state('all');

  const tags = $derived(
    [...new Set(data.posts.flatMap((post) => post.categories))].sort((a, b) => a.localeCompare(b))
  );

  const visible = $derived(
    data.posts.filter((post) => {
      const needle = query.trim().toLowerCase();
      const matchesQuery =
        needle.length === 0 ||
        post.title.toLowerCase().includes(needle) ||
        post.description.toLowerCase().includes(needle);
      const matchesTag = tag === 'all' || post.categories.includes(tag);
      return matchesQuery && matchesTag;
    })
  );
</script>

<Metadata
  title="My Blog"
  description="Welcome to my devblog where I post about my projects and ideas."
  url="/blog"
  image="/assets/thunderbirdfalls.webp"
  imageAlt="Thunderbird Falls - Alaska"
/>

<div class="blog font-serif">
  <header>
    <h1>The Blog</h1>
    <p>Ideas, rants, and other things worth writing down.</p>
    <form class="filters" onsubmit={(event) => event.preventDefault()}>
      <label>
        <span class="sr">Search posts</span>
        <input type="search" placeholder="Search" bind:value={query} />
      </label>
      <label>
        <span class="sr">Filter by tag</span>
        <select bind:value={tag}>
          <option value="all">All tags</option>
          {#each tags as item (item)}
            <option value={item}>{item}</option>
          {/each}
        </select>
      </label>
    </form>
  </header>

  {#if visible.length === 0}
    <p class="empty">Nothing matched.</p>
  {:else}
    <ul>
      {#each visible as post (post.slug)}
        <li>
          <a href={resolve('/[slug]', { slug: post.slug })}>
            <img src={post.image || '/previews/spencer-glacier.webp'} alt="" />
            <div>
              <h2>{post.title}</h2>
              <p class="date">{formatDate(post.date)}</p>
              <p>{post.description}</p>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .blog {
    max-width: 46rem;
    margin-inline: auto;
    padding: 2.25rem 1.5rem 2rem;
    color: var(--ink);
  }

  h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 500;
  }

  header > p {
    margin: 0.4rem 0 0;
    color: var(--ink-muted);
    font-size: 1.3rem;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.75rem;
  }

  input,
  select {
    min-height: 2.75rem;
    border: 0;
    border-bottom: 1px solid var(--input-border);
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 1.15rem;
  }

  input {
    width: min(100%, 16rem);
    padding: 0.3rem 0;
  }

  select {
    padding-inline: 0.2rem;
  }

  input:focus-visible,
  select:focus-visible {
    outline: none;
    border-bottom-color: var(--ink-accent);
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  ul {
    display: grid;
    gap: 0.85rem;
    margin: 2.5rem 0 0;
    padding: 0;
    list-style: none;
  }

  li a {
    display: grid;
    gap: 1rem;
    padding: 0.85rem;
    border: 1px solid var(--card-border);
    background: var(--card-bg);
    color: inherit;
  }

  li a:hover h2,
  li a:focus-visible h2 {
    color: var(--ink-accent);
  }

  li a:focus-visible {
    outline: none;
  }

  img {
    width: 100%;
    height: 11rem;
    object-fit: cover;
  }

  h2 {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 500;
  }

  .date,
  li p {
    margin: 0.25rem 0 0;
    color: var(--ink-muted);
  }

  .date {
    font-size: 0.95rem;
    letter-spacing: 0.06em;
  }

  li p {
    font-size: 1.15rem;
    line-height: 1.45;
  }

  .empty {
    margin-top: 2.5rem;
    color: var(--ink-muted);
    font-size: 1.25rem;
  }

  @media (min-width: 640px) {
    li a {
      grid-template-columns: 11rem 1fr;
      align-items: center;
    }

    img {
      height: 8rem;
    }
  }
</style>
