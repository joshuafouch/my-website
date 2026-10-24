<script lang="ts">
  import { resolve } from '$app/paths';
  import ProjectEditor from '#lib/components/ProjectEditor.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Edit project</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Edit project</h1>
    {#if data.saved}
      <p class="ok">Saved.</p>
    {/if}
  </div>
  <a class="quiet-link" href={resolve('/admin/projects')}>All projects</a>
</header>

<ProjectEditor project={data.project} {form} />
