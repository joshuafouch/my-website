<script lang="ts">
  import { resolve } from '$app/paths';
  import PersonalForm from '#lib/components/PersonalForm.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Personal</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Personal</h1>
  </div>
  <a class="quiet-link" href={resolve('/about/personal')}>View on site</a>
</header>

<PersonalForm
  content={form?.content ?? data}
  error={form?.error ?? ''}
  saved={data.saved && !form}
/>
