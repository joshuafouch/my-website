<script lang="ts">
  import { resolve } from '$app/paths';
  import ProjectEditor from '#lib/components/ProjectEditor.svelte';

  let { form } = $props();
</script>

<svelte:head>
  <title>New project</title>
</svelte:head>

<header class="head">
  <h1>New project</h1>
  <a class="quiet-link" href={resolve('/admin/projects')}>All projects</a>
</header>

<ProjectEditor {form} />
