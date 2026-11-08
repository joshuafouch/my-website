<script lang="ts">
  import { resolve } from '$app/paths';
  import { formatDate } from '#lib/utils.ts';

  let { data } = $props();
</script>

<svelte:head>
  <title>Projects</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Projects</h1>
    <p class="note">Drafts stay off the site until you publish them.</p>
  </div>
  <a class="solid" href={resolve('/admin/projects/new')}>New project</a>
</header>

{#if data.projects.length === 0}
  <p class="note">No projects yet.</p>
{:else}
  <ul class="index">
    {#each data.projects as project (project.id)}
      <li>
        <a
          class:has-image={Boolean(project.image)}
          href={resolve('/admin/projects/[slug]', { slug: project.slug })}
        >
          {#if project.image}
            <img src={project.image} alt="" />
          {/if}
          <span>
            <span class="name">{project.title}</span>
            <span class="meta"
              >{formatDate(project.date)} · {project.published ? 'Published' : 'Draft'}</span
            >
          </span>
        </a>
      </li>
    {/each}
  </ul>
{/if}
