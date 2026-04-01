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
      <p class="font-main text-accent mb-5 text-xl">
        If you want to let me know anything or send something random, please do so below, okay?
      </p>
    </div>
  </div>
</div>

<div class="text-neutral-content container mx-auto max-w-5xl p-8">
  <div id="contact" class="text-neutral-content container mx-auto max-w-4xl pt-20 pb-16">
    <div class="card bg-base-300 p-8 text-center shadow-xl">
      <h2 class="font-title mb-4 text-3xl font-semibold">Contact Me</h2>

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
          Send me a message below, Please enter your correct email so I can send back a reply!
        </p>
      {/if}

      <div class="flex flex-col items-center space-y-6">
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
