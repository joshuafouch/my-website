<script lang="ts">
  import emailjs from '@emailjs/browser';

  const SERVICE_ID = "service_fasfba7";
  const TEMPLATE_ID = "template_sm4vbpc";
  const PUBLIC_KEY = "qxjhfX145_1dIzpdX";

  let contactForm: HTMLFormElement;
  let status = ""; // To store success/error messages
  let isSubmitting = false; // To disable button while sending

  const sendEmail = () => {
    isSubmitting = true;
    status = "Sending...";

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, contactForm, {
        publicKey: PUBLIC_KEY,
      })
      .then(
        () => {
          status = "Message sent successfully!";
          isSubmitting = false;
          contactForm.reset(); // Clear the form
          // Clear success message after 5 seconds
          setTimeout(() => { status = "" }, 5000);
        },
        (error) => {
          status = "Failed to send message. Please try again.";
          isSubmitting = false;
          console.error('FAILED...', error.text);
        },
      );
  };
</script>

<div class="container mx-auto max-w-5xl p-8 text-neutral-content">
  <div id="contact" class="container mx-auto max-w-4xl pt-32 pb-16 text-neutral-content">
    <div class="card bg-base-300 p-8 shadow-xl text-center">
      <h2 class="font-title mb-4 text-3xl font-semibold">Contact Me</h2>
      
      {#if status}
        <p class="font-main mb-6 text-lg {status.includes('Failed') ? 'text-red-400' : 'text-green-400'}">
          {status}
        </p>
      {:else}
         <p class="font-main mb-6 text-lg text-gray-400">
          Send me a message below!
        </p>
      {/if}

      <div class="flex flex-col items-center space-y-6">
        <div class="w-full max-w-lg">
          <form 
            class="space-y-4" 
            bind:this={contactForm} 
            on:submit|preventDefault={sendEmail}
          >
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
            
            <button 
              type="submit" 
              class="btn btn-primary w-full font-main"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
