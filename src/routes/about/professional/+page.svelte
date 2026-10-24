<script lang="ts">
  import Metadata from '#lib/components/Metadata.svelte';
  import ProfessionalAbout from '#lib/components/ProfessionalAbout.svelte';

  let { data } = $props();
</script>

<Metadata
  title="Professional - Joshua Fouch"
  description="Work experience and the technologies Joshua Fouch uses, from the Alaska Railroad to Franciscan University."
  url="/about/professional"
  image={data.portraits[0]?.src || '/assets/joshportraits/joshpfp1.jpg'}
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
