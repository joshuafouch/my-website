<script lang="ts">
  import ProfessionalPortraitsEditor from '#lib/components/ProfessionalPortraitsEditor.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Professional · Portraits</title>
</svelte:head>

<ProfessionalPortraitsEditor
  portraits={form?.portraits ?? data.portraits}
  images={data.images}
  imageError={data.imageError}
  error={form?.error ?? ''}
  saved={data.saved && !form}
/>
