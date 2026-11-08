<script lang="ts">
  import PortraitsEditor from '#lib/components/PortraitsEditor.svelte';

  let { data, form } = $props();
</script>

<svelte:head>
  <title>Personal · Portraits</title>
</svelte:head>

<PortraitsEditor
  kind="personal"
  portraits={form?.portraits ?? data.portraits}
  images={data.images}
  imageError={data.imageError}
  error={form?.error ?? ''}
  saved={data.saved && !form}
  note="Informal portraits for the personal about page. They sit on the right of the introduction and rotate slowly."
/>
