<script lang="ts">
  import PersonalForm from '#lib/components/PersonalForm.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Personal · Introduction</title>
</svelte:head>

<PersonalForm
  content={form?.content ?? data}
  error={form?.error ?? ''}
  saved={data.saved && !form}
  discogsReady={data.discogsReady}
/>
