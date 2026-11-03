<script lang="ts">
  import Metadata from '#lib/components/Metadata.svelte';
  import PersonalAbout from '#lib/components/PersonalAbout.svelte';

  let { data } = $props();
</script>

<Metadata
  title="Personal - Joshua Fouch"
  description={data.intro.trim() || 'A few personal notes from Joshua Fouch.'}
  url="/about/personal"
  image={data.portraits[0]?.src || '/assets/backgrounds/hero-bg.webp'}
  imageAlt="Joshua Fouch"
/>

<PersonalAbout
  introHtml={data.introHtml}
  youtubeUrl={data.youtubeUrl}
  portraits={data.portraits}
  library={data.library}
/>
