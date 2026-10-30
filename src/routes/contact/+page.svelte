<script lang="ts">
  import emailjs from '@emailjs/browser';
  import Metadata from '#lib/components/Metadata.svelte';

  export let data: { resumeUrl: string };

  const SERVICE_ID = 'service_fasfba7';
  const TEMPLATE_ID = 'template_sm4vbpc';
  const PUBLIC_KEY = 'qxjhfX145_1dIzpdX';

  let contactForm: HTMLFormElement;
  let status = ''; // To store success/error messages
  let isSubmitting = false; // To disable button while sending

  const sendEmail = (event: SubmitEvent) => {
    event.preventDefault();
    isSubmitting = true;
    status = 'Sending...';

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, contactForm, {
        publicKey: PUBLIC_KEY
      })
      .then(
        () => {
          status = 'Message sent successfully!';
          isSubmitting = false;
          contactForm.reset(); // Clear the form
          // Clear success message after 5 seconds
          setTimeout(() => {
            status = '';
          }, 5000);
        },
        (error) => {
          status = 'Failed to send message. Please try again.';
          isSubmitting = false;
          console.error('FAILED...', error.text);
        }
      );
  };
</script>

<Metadata
  title="Contact Me - Joshua Fouch"
  description="Get in touch with Joshua Fouch. Send a message about projects, opportunities, or just to say hello."
  url="/contact"
  image="/assets/backgrounds/valleybutte.webp"
  imageAlt="Contact Joshua Fouch"
/>

<section class="contact font-serif">
  <h1>Contact Me</h1>

  <div id="contact" class="panel">
    {#if status}
      <p class="lead" class:failed={status.includes('Failed')}>{status}</p>
    {:else}
      <p class="lead">Send me a message below or click on the links.</p>
    {/if}

    <p class="links">
      <a
        class="quiet-link"
        href="https://github.com/joshuafouch"
        target="_blank"
        rel="noopener noreferrer">GitHub</a
      >
      <a
        class="quiet-link"
        href="https://www.linkedin.com/in/joshua-fouch12"
        target="_blank"
        rel="noopener noreferrer">LinkedIn</a
      >
      <a class="quiet-link" href={data.resumeUrl} target="_blank" rel="noopener noreferrer"
        >Resume</a
      >
    </p>

    <p class="or">OR</p>

    <form bind:this={contactForm} onsubmit={sendEmail}>
      <label>
        <span class="sr">Your Name</span>
        <input type="text" name="user_name" placeholder="Your Name" required />
      </label>
      <label>
        <span class="sr">Your Email</span>
        <input type="email" name="user_email" placeholder="Your Email" required />
      </label>
      <label>
        <span class="sr">Your Message</span>
        <textarea name="message" placeholder="Your Message" required></textarea>
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  </div>
</section>

<style>
  .contact {
    max-width: 40rem;
    margin-inline: auto;
    padding: 2.25rem 1.5rem 3rem;
    color: var(--ink);
  }

  h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 500;
  }

  .panel {
    margin-top: 1.5rem;
    padding: 1.4rem 1.35rem 1.5rem;
    border: 1px solid var(--card-border);
    background: var(--card-bg);
  }

  .lead {
    margin: 0;
    color: var(--ink-muted);
    font-size: 1.25rem;
    line-height: 1.45;
  }

  .lead.failed {
    color: #bf616a;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.4rem;
    margin: 1.1rem 0 0;
    font-variant: small-caps;
    letter-spacing: 0.12em;
  }

  .or {
    margin: 1.4rem 0 0;
    color: var(--ink-muted);
    font-variant: small-caps;
    letter-spacing: 0.16em;
  }

  form {
    display: grid;
    gap: 0.9rem;
    margin-top: 1rem;
  }

  input,
  textarea {
    width: 100%;
    border: 0;
    border-bottom: 1px solid var(--input-border);
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 1.15rem;
    padding: 0.4rem 0;
  }

  textarea {
    min-height: 8rem;
    resize: vertical;
  }

  input:focus-visible,
  textarea:focus-visible,
  button:focus-visible {
    outline: none;
    border-bottom-color: var(--ink-accent);
  }

  button {
    justify-self: start;
    margin-top: 0.4rem;
    padding: 0.45rem 0;
    border: 0;
    border-bottom: 1px solid transparent;
    background: none;
    color: var(--ink);
    font: inherit;
    font-variant: small-caps;
    letter-spacing: 0.12em;
    cursor: pointer;
  }

  button:hover,
  button:focus-visible {
    color: var(--ink-accent);
  }

  button:disabled {
    cursor: wait;
    opacity: 0.7;
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
</style>
