<script lang="ts">
  import PersonalForm from '#lib/components/PersonalForm.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Personal</title>
</svelte:head>

<h1>Personal</h1>
<PersonalForm
  content={form?.content ?? data}
  error={form?.error ?? ''}
  saved={data.saved && !form}
/>
