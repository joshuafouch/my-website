<script lang="ts">
  import ProfessionalTechEditor from '#lib/components/ProfessionalTechEditor.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Professional · Tech stack</title>
</svelte:head>

<ProfessionalTechEditor
  techIntro={form?.techIntro ?? data.techIntro}
  groups={form?.groups ?? data.groups}
  error={form?.error ?? ''}
  saved={data.saved && !form}
/>
