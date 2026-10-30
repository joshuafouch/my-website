<script lang="ts">
  import ProfessionalWorkEditor from '#lib/components/ProfessionalWorkEditor.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Professional · Work</title>
</svelte:head>

<ProfessionalWorkEditor
  workIntro={form?.workIntro ?? data.workIntro}
  jobs={form?.jobs ?? data.jobs}
  error={form?.error ?? ''}
  saved={data.saved && !form}
/>
