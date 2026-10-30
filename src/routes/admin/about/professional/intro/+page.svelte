<script lang="ts">
  import ProfessionalIntroEditor from '#lib/components/ProfessionalIntroEditor.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Professional · Introduction</title>
</svelte:head>

<ProfessionalIntroEditor
  intro={form?.intro ?? data.intro}
  error={form?.error ?? ''}
  saved={data.saved && !form}
/>
