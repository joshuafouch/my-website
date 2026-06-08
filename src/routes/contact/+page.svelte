<script lang="ts">
  import emailjs from '@emailjs/browser';
  import Metadata from '$lib/components/Metadata.svelte';

  const SERVICE_ID = 'service_fasfba7';
  const TEMPLATE_ID = 'template_sm4vbpc';
  const PUBLIC_KEY = 'qxjhfX145_1dIzpdX';

  let contactForm: HTMLFormElement;
  let status = ''; // To store success/error messages
  let isSubmitting = false; // To disable button while sending

  const sendEmail = () => {
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
  image="/assets/valleybutte.webp"
  imageAlt="Contact Joshua Fouch"
/>

<div
  class="hero h-[60vh] rounded-b-4xl bg-cover bg-bottom sm:bg-fixed sm:bg-center"
  style="background-image: url(/assets/valleybutte.webp);"
>
  <div class="hero-overlay rounded-b-4xl bg-black/60"></div>
  <div class="hero-content text-neutral-content pt-24 text-center">
    <div class="max-w-md">
      <h1 class="font-title mb-5 text-5xl font-bold">Contact Me</h1>
    </div>
  </div>
</div>

<div class="text-neutral-content container mx-auto max-w-5xl p-8">
  <div id="contact" class="text-neutral-content container mx-auto max-w-4xl pt-20 pb-16">
    <div class="card bg-base-300 p-8 text-center shadow-xl">
      {#if status}
        <p
          class="font-main mb-6 text-lg {status.includes('Failed')
            ? 'text-red-400'
            : 'text-green-400'}"
        >
          {status}
        </p>
      {:else}
        <p class="font-main mb-6 text-lg text-gray-400">
          Send me a message below or click on the links.
        </p>
      {/if}

      <div class="flex flex-col items-center space-y-6">
        <div class="flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/joshuafouch"
            target="_blank"
            class="btn btn-primary font-main flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.022c-3.338.724-4.033-1.61-4.033-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.527.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.403c1.018.005 2.044.138 3.003.403 2.291-1.552 3.297-1.23 3.297-1.23.655 1.649.243 2.873.12 3.176.77.84 1.236 1.911 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.43.37.815 1.102.815 2.222v3.293c0 .321.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/joshua-fouch12"
            target="_blank"
            class="btn btn-success font-main flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.762 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.867-3.063-1.867 0-2.154 1.459-2.154 2.969v5.698h-3v-10h2.881v1.367h.041c.401-.762 1.381-1.564 2.841-1.564 3.037 0 3.599 2.028 3.599 4.675v5.522z"
              />
            </svg>
            LinkedIn
          </a>
          <a
            href="/assets/jf_resume25-26.pdf"
            target="_blank"
            class="btn btn-accent font-main flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Resume
          </a>
        </div>

        <div class="divider">OR</div>

        <div class="w-full max-w-lg">
          <form class="space-y-4" bind:this={contactForm} on:submit|preventDefault={sendEmail}>
            <input
              type="text"
              name="user_name"
              placeholder="Your Name"
              class="input input-bordered w-full"
              required
            />

            <input
              type="email"
              name="user_email"
              placeholder="Your Email"
              class="input input-bordered w-full"
              required
            />

            <textarea
              name="message"
              class="textarea textarea-bordered w-full"
              placeholder="Your Message"
              required
            ></textarea>

            <button type="submit" class="btn btn-primary font-main w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
