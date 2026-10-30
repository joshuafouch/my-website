<script lang="ts">
  import Metadata from '#lib/components/Metadata.svelte';

  let { data } = $props();

  const pdf = $derived(data.resume.url);
  const heroImage = '/assets/backgrounds/hero-bg.webp';
</script>

<Metadata
  title="Resume - Joshua Fouch"
  description="Joshua Fouch's resume."
  url="/resume"
  image={heroImage}
  imageAlt="Joshua Fouch"
/>

<section class="resume font-serif">
  <div class="sheet">
    <header>
      <h1>Resume</h1>
      <p class="actions">
        <a class="quiet-link phone-only" href={pdf} target="_blank" rel="noopener noreferrer"
          >Open resume</a
        >
        <a class="quiet-link" href={pdf} download={data.resume.filename}>Download</a>
      </p>
    </header>

    <iframe class="frame" src={pdf} title="Joshua Fouch resume"></iframe>
  </div>
</section>

<style>
  .resume {
    position: relative;
    min-height: 100svh;
    color: var(--ink);
  }

  .sheet {
    position: relative;
    max-width: 56rem;
    margin-inline: auto;
    padding: 2.25rem 1.25rem 2.5rem;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 1.25rem;
    margin: 0;
    font-variant: small-caps;
    letter-spacing: 0.12em;
    font-size: 1.2rem;
  }

  .frame {
    display: none;
    width: 100%;
    height: 80svh;
    margin-top: 1.5rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 28%, transparent);
    background: var(--nord6);
  }

  @media (min-width: 640px) {
    .frame {
      display: block;
    }

    .phone-only {
      display: none;
    }
  }
</style>
