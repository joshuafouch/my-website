<script lang="ts">
  import Metadata from '#lib/components/Metadata.svelte';
  import ProfessionalAbout from '#lib/components/ProfessionalAbout.svelte';

  let { data } = $props();
</script>

<Metadata
  title="About - Joshua Fouch"
  description="Where I've worked and what I work with."
  url="/about/professional"
  image={data.portraits[0]?.src || '/assets/backgrounds/hero-bg.webp'}
  imageAlt="Joshua Fouch"
/>

<ProfessionalAbout
  introHtml={data.introHtml}
  workIntro={data.workIntro}
  techIntro={data.techIntro}
  portraits={data.portraits}
  jobs={data.jobs}
  groups={data.groups}
/>
