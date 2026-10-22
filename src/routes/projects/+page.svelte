<script lang="ts">
  // import * as config from '#lib/config.ts';
  import Metadata from '#lib/components/Metadata.svelte';
  import { formatDate } from '#lib/utils.ts';
  import { resolve } from '$app/paths';
  let { data } = $props();
</script>

<Metadata
  title="My Projects"
  description="A collection of my professional, personal, and academic projects"
  url="/projects"
  image="/assets/happy_snow.webp"
  imageAlt="My Projects"
/>

<header class="px-4 pt-32 text-center">
  <h1 class="font-title text-5xl font-bold">My Projects</h1>
</header>

<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
  <section>
    <div class="grid grid-cols-1 gap-8 pt-8 md:grid-cols-2 lg:grid-cols-3 lg:pt-10">
      {#each data.projects as project (project.slug)}
        <a
          href={resolve('/[slug]', { slug: project.slug })}
          class="card bg-neutral border-secondary border-2 text-left shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <figure>
            <img
              class="h-56 w-full object-cover opacity-75"
              src={project.image || '/previews/spencer-glacier.webp'}
              alt={project.title}
            />
          </figure>
          <div class="card-body">
            <h2 class="card-title font-title">{project.title}</h2>
            <p class="text-sm opacity-70">{formatDate(project.date)}</p>
            <p class="text-base-content/80 mt-2">{project.description}</p>
          </div>
        </a>
      {/each}
    </div>
  </section>
</div>
