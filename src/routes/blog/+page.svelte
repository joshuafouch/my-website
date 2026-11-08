<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { formatDate } from '#lib/utils.ts';
  import Metadata from '#lib/components/Metadata.svelte';
  import { FALLBACK_COVER, FALLBACK_COVER_SRCSET } from '#lib/fallback-cover.ts';

  let { data } = $props();

  let query = $state('');
  let menuOpen = $state(false);
  let picker: HTMLDivElement | undefined = $state();

  const tags = $derived(
    [...new Set(data.posts.flatMap((post) => post.categories))].sort((a, b) => a.localeCompare(b))
  );

  // The tag lives in the URL (/blog?tag=theology) so it can be linked, and so the header's
  // breadcrumb can show it.
  const tag = $derived(page.url.searchParams.get('tag') ?? 'all');

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

  const tagHref = (value: string) =>
    value === 'all' ? resolve('/blog') : `${resolve('/blog')}?tag=${encodeURIComponent(value)}`;

  function onWindowClick(event: MouseEvent) {
    if (menuOpen && picker && !picker.contains(event.target as Node)) menuOpen = false;
  }
</script>

<svelte:window
  onclick={onWindowClick}
  onkeydown={(event) => {
    if (event.key === 'Escape') menuOpen = false;
  }}
/>

<Metadata
  title="My Blog"
  description="Welcome to my devblog where I post about my projects and ideas."
  url="/blog"
  image="/assets/backgrounds/IMG_1797.webp"
  imageAlt="Dog on a dock"
/>

<div class="blog font-serif">
  <header class="rise" style:--i={0}>
    <h1>The Blog</h1>
    <p>Ideas, rants, and other things worth writing down.</p>
  </header>

  <!-- One ruled line: a prompt to search, and the tag menu. -->
  <div class="bar rise" style:--i={1} role="search">
    <label class="search">
      <span class="prompt font-mono" aria-hidden="true">›</span>
      <span class="sr-only">Search posts</span>
      <input class="font-mono" type="search" placeholder="search posts" bind:value={query} />
    </label>

    <div class="picker" class:open={menuOpen} bind:this={picker}>
      <button
        type="button"
        class="toggle font-mono"
        aria-expanded={menuOpen}
        aria-controls="tag-menu"
        onclick={() => (menuOpen = !menuOpen)}
      >
        <span class="key">tags</span>
        <span class="value">{tag}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.5 6 8 10.5 12.5 6" fill="none" stroke="currentColor" stroke-width="1.3" />
        </svg>
      </button>
      {#if menuOpen}
        <ul id="tag-menu" class="menu font-mono">
          {#each ['all', ...tags] as item (item)}
            <li>
              <!-- eslint-disable svelte/no-navigation-without-resolve -- resolved in tagHref -->
              <a
                href={tagHref(item)}
                aria-current={item === tag ? 'true' : undefined}
                data-sveltekit-noscroll
                data-sveltekit-replacestate
                data-sveltekit-keepfocus
                onclick={() => (menuOpen = false)}
              >
                {item}
                <span class="mark" aria-hidden="true"></span>
              </a>
              <!-- eslint-enable svelte/no-navigation-without-resolve -->
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  {#if visible.length === 0}
    <p class="empty">Nothing matched.</p>
  {:else}
    <ul class="posts">
      {#each visible as post, index (post.slug)}
        <li class="rise" style:--i={index + 2}>
          <a class="card" href={resolve('/[slug]', { slug: post.slug })}>
            <span class="mat">
              <span class="frame">
                <img
                  src={post.image || FALLBACK_COVER}
                  srcset={post.image ? undefined : FALLBACK_COVER_SRCSET}
                  sizes={post.image ? undefined : '(min-width: 700px) 28rem, 100vw'}
                  alt=""
                  loading={index > 1 ? 'lazy' : undefined}
                  decoding="async"
                />
              </span>
            </span>
            <span class="copy">
              <span class="title">{post.title}</span>
              <span class="date font-mono">{formatDate(post.date).toLowerCase()}</span>
              {#if post.description}
                <span class="desc">{post.description}</span>
              {/if}
              <span class="tags">{post.categories.join(' · ')}</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .blog {
    max-width: var(--page-width);
    margin-inline: auto;
    padding: 2.25rem 1.5rem 2rem;
    color: var(--ink);
  }

  h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 500;
    line-height: 1;
  }

  header > p {
    margin: 0.5rem 0 0;
    color: var(--ink-muted);
    font-size: 1.3rem;
  }

  .bar {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: stretch;
    margin-top: 1.75rem;
    border-top: 1px solid var(--border-strong);
    border-bottom: 1px solid var(--border-subtle);
    transition: border-color 300ms ease;
  }

  .bar:focus-within {
    border-bottom-color: var(--ink-accent);
  }

  .search {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
  }

  .prompt {
    color: var(--ink-accent);
    font-size: 0.9rem;
  }

  input {
    flex: 1;
    min-width: 0;
    min-height: 2.9rem;
    border: 0;
    background: transparent;
    color: var(--ink);
    font-size: 0.88rem;
    letter-spacing: 0.02em;
    outline: none;
  }

  input::placeholder {
    color: var(--ink-faint);
  }

  input::-webkit-search-cancel-button {
    display: none;
  }

  .picker {
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 1.1rem;
    border-left: 1px solid var(--border-subtle);
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-height: 2.9rem;
    padding: 0 0.15rem;
    border: 0;
    background: none;
    color: var(--ink-muted);
    font-size: 0.85rem;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: color 220ms ease;
  }

  .toggle:hover,
  .toggle:focus-visible {
    color: var(--ink);
    outline: none;
  }

  .key {
    color: var(--ink-faint);
  }

  .value {
    color: var(--ink);
  }

  .toggle svg {
    width: 0.75rem;
    height: 0.75rem;
    transition: rotate 220ms var(--ease-out);
  }

  .open .toggle svg {
    rotate: 180deg;
  }

  .menu {
    position: absolute;
    top: calc(100% + 0.75rem);
    right: 0;
    min-width: 13rem;
    margin: 0;
    padding: 0.35rem 0;
    list-style: none;
    border: 1px solid var(--border-strong);
    background: var(--surface-raised);
    box-shadow: 0 18px 48px color-mix(in oklab, var(--nord0) 35%, transparent);
    animation: vt-rise 200ms var(--ease-out) both;
  }

  .menu::before,
  .menu::after {
    content: '';
    position: absolute;
    width: 0.6rem;
    height: 0.6rem;
    border: 0 solid var(--ink-accent);
  }

  .menu::before {
    top: -0.45rem;
    left: -0.45rem;
    border-width: 1px 0 0 1px;
  }

  .menu::after {
    right: -0.45rem;
    bottom: -0.45rem;
    border-width: 0 1px 1px 0;
  }

  .menu a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 2.5rem;
    padding: 0 1.1rem;
    color: var(--ink-muted);
    font-size: 0.85rem;
    letter-spacing: 0.02em;
    text-decoration: none;
    transition:
      color 220ms ease,
      translate 320ms var(--ease-out);
  }

  .menu a:hover,
  .menu a:focus-visible {
    color: var(--ink-accent);
    translate: 0.3rem 0;
    outline: none;
  }

  .menu a[aria-current='true'] {
    color: var(--ink);
  }

  .mark {
    width: 0.75rem;
    height: 1px;
    background: var(--ink-accent);
    opacity: 0;
  }

  [aria-current='true'] .mark {
    opacity: 1;
  }

  .posts {
    display: grid;
    gap: 3.25rem;
    margin: 2.75rem 0 0;
    padding: 0;
    list-style: none;
  }

  .card {
    display: grid;
    grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
    gap: 2.25rem;
    align-items: end;
    color: inherit;
    text-decoration: none;
    transition: transform 220ms var(--ease-out);
  }

  .frame {
    display: block;
    overflow: hidden;
    aspect-ratio: 16 / 10;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 480ms var(--ease-out);
  }

  .copy {
    display: flex;
    flex-direction: column;
    padding-bottom: 0.25rem;
  }

  .title {
    font-size: 1.85rem;
    font-weight: 500;
    line-height: 1.15;
    transition: color 180ms ease;
  }

  .date {
    margin-top: 0.45rem;
    color: var(--ink-faint);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  .desc {
    margin-top: 0.6rem;
    color: var(--ink-muted);
    font-size: 1.15rem;
    line-height: 1.45;
  }

  .tags {
    margin-top: 0.85rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--border-subtle);
    color: var(--ink-muted);
    font-size: 1.03rem;
    font-variant: small-caps;
    letter-spacing: 0.12em;
  }

  .card:hover,
  .card:focus-visible {
    transform: translateY(-2px);
    outline: none;
  }

  .card:hover .mat,
  .card:focus-visible .mat {
    border-color: var(--border-strong);
  }

  .card:hover .mat::before,
  .card:hover .mat::after,
  .card:focus-visible .mat::before,
  .card:focus-visible .mat::after {
    border-color: var(--ink-accent);
  }

  .card:hover img,
  .card:focus-visible img {
    transform: scale(1.03);
  }

  .card:hover .title,
  .card:focus-visible .title {
    color: var(--ink-accent);
  }

  .empty {
    margin-top: 2.5rem;
    color: var(--ink-muted);
    font-size: 1.25rem;
  }

  @media (max-width: 700px) {
    .card {
      grid-template-columns: minmax(0, 1fr);
      gap: 1rem;
    }

    .title {
      font-size: 1.6rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card,
    img,
    .menu,
    .menu a {
      transition: none;
      animation: none;
    }

    .card:hover,
    .card:focus-visible,
    .card:hover img,
    .card:focus-visible img,
    .menu a:hover {
      transform: none;
      translate: none;
    }
  }
</style>
