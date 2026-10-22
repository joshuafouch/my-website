<script lang="ts">
  import Metadata from '#lib/components/Metadata.svelte';
  import { asset } from '$app/paths';

  const pdf = asset('assets/jf_resume26-27.pdf');
  const heroImage = '/assets/hero-bg.webp';
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
        <a class="quiet-link" href={pdf} download="jf_resume.pdf">Download</a>
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
    padding: 7.5rem 1.25rem 2.5rem;
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
    border: 0;
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
