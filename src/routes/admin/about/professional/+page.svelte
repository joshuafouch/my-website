<script lang="ts">
  import ProfessionalForm from '#lib/components/ProfessionalForm.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Professional</title>
</svelte:head>

<h1>Professional</h1>
<ProfessionalForm
  content={form?.content ?? data}
  error={form?.error ?? ''}
  saved={data.saved && !form}
/>
