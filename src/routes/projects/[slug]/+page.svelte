<script lang="ts">
  import { resolve } from '$app/paths';
  import Metadata from '#lib/components/Metadata.svelte';
  import PageTurn from '#lib/components/PageTurn.svelte';
  import ProjectPreview from '#lib/components/ProjectPreview.svelte';

  let { data } = $props();

  const project = $derived(data.project);
  const cover = $derived(project.image || '/assets/backgrounds/IMG_1797.webp');
  const turn = (to: { title: string; slug: string } | null, label: string) =>
    to ? { label, title: to.title, href: resolve('/projects/[slug]', { slug: to.slug }) } : null;
</script>

<Metadata
  title={`${project.title} - Joshua Fouch`}
  description={project.description || `${project.title}, a project by Joshua Fouch.`}
  url={`/projects/${project.slug}`}
  image={cover}
  imageAlt={project.title}
/>

<div class="page">
  <ProjectPreview
    title={project.title}
    description={project.description}
    detailsHtml={project.detailsHtml}
    image={project.image}
    images={project.images ?? []}
    tags={project.tags ?? []}
    sourceUrl={project.sourceUrl ?? ''}
    date={project.date}
  />
  <PageTurn
    label="More projects"
    previous={turn(data.previous, 'previous')}
    next={turn(data.next, 'next')}
  />
</div>

<style>
  .page {
    max-width: var(--page-width);
    margin-inline: auto;
    padding: 2.25rem 1.5rem 3rem;
  }
</style>
