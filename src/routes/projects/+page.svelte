<script lang="ts">
  import { resolve } from '$app/paths';
  import Metadata from '#lib/components/Metadata.svelte';
  import { FALLBACK_COVER, FALLBACK_COVER_SRCSET } from '#lib/fallback-cover.ts';

  let { data } = $props();

  const year = (date: string) => (/^\d{4}/.test(date) ? date.slice(0, 4) : '');
</script>

<Metadata
  title="My Projects"
  description="Personal, research, and collaborative projects."
  url="/projects"
  image="/assets/backgrounds/IMG_1797.webp"
  imageAlt="Dog on a dock"
/>

<div class="projects font-serif">
  <header class="rise" style:--i={0}>
    <h1>Projects</h1>
    <p>Personal, research, and collaborative projects.</p>
  </header>

  {#if data.projects.length === 0}
    <p class="empty">Nothing here yet.</p>
  {:else}
    <ul>
      {#each data.projects as project, index (project.slug)}
        <li class="rise" class:feature={index === 0} style:--i={index + 1}>
          <a class="card" href={resolve('/projects/[slug]', { slug: project.slug })}>
            <span class="mat">
              <span class="frame">
                <img
                  src={project.image || FALLBACK_COVER}
                  srcset={project.image ? undefined : FALLBACK_COVER_SRCSET}
                  sizes={project.image ? undefined : '(max-width: 640px) 100vw, 30rem'}
                  alt=""
                />
              </span>
            </span>
            <span class="copy">
              <span class="title">{project.title}</span>
              {#if year(project.date)}
                <span class="year font-mono">{year(project.date)}</span>
              {/if}
              {#if project.description}
                <span class="desc">{project.description}</span>
              {/if}
              <span class="tags">{project.tags.join(' · ')}</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .projects {
    max-width: var(--page-width);
    margin-inline: auto;
    padding: 2.25rem 1.5rem 2.5rem;
    color: var(--ink);
  }

  header {
    padding-bottom: 1.4rem;
    border-bottom: 1px solid var(--border-strong);
  }

  h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 500;
    line-height: 1;
  }

  header p,
  .empty {
    color: var(--ink-muted);
  }

  header p {
    margin: 0.5rem 0 0;
    font-size: 1.3rem;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3.25rem 2.5rem;
    margin: 2.75rem 0 0;
    padding: 0;
    list-style: none;
  }

  .feature {
    grid-column: 1 / -1;
  }

  .card {
    display: flex;
    flex-direction: column;
    color: inherit;
    text-decoration: none;
    transition: transform 220ms var(--ease-out);
  }

  .feature .card {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 2.25rem;
    align-items: end;
  }

  .frame {
    display: block;
    overflow: hidden;
    aspect-ratio: 4 / 3;
  }

  .feature .frame {
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
    padding-top: 1rem;
  }

  .feature .copy {
    padding: 0 0 0.25rem;
  }

  .title {
    font-size: 1.8rem;
    font-weight: 500;
    line-height: 1.1;
    transition: color 180ms ease;
  }

  .feature .title {
    font-size: 2.5rem;
  }

  .year {
    margin-top: 0.35rem;
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
    margin-top: 2rem;
    font-size: 1.25rem;
  }

  @media (max-width: 700px) {
    ul {
      grid-template-columns: minmax(0, 1fr);
    }

    .feature .card {
      display: flex;
      gap: 0;
    }

    .feature .copy {
      padding-top: 1rem;
    }

    .feature .title {
      font-size: 2rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card,
    img {
      transition: none;
    }

    .card:hover,
    .card:focus-visible,
    .card:hover img,
    .card:focus-visible img {
      transform: none;
    }
  }
</style>
