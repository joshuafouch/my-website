<script>
  import { fly } from 'svelte/transition';
  import { links } from '$lib/config';

  export let open = false;

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
</script>

{#if open}
  <div
    role="button"
    tabindex="0"
    on:click={() => (open = false)}
    on:keydown={(e) => e.key === 'Enter' && (open = false)}
    class="fixed inset-0 z-40 bg-black/60"
    transition:fly={{ duration: 300, x: '100%' }}
  ></div>
  <aside
    class="bg-base-200/80 shadow-info fixed top-0 right-0 z-[60] h-min w-64 rounded-l-xl p-1 shadow-lg backdrop-blur-md"
    transition:fly={{ duration: 300, x: '100%' }}
  >
    <ul class="flex flex-col justify-center gap-2">
      <li>
        <button
          on:click={scrollToTop}
          on:click={() => (open = false)}
          class="btn btn-ghost font-title text-accent hover:text-success w-full text-xl"
        >
          Go to Top
        </button>
      </li>
      {#each links as link (link.href)}
        <li>
          <a
            href={link.href}
            on:click={() => (open = false)}
            class="btn btn-ghost font-title hover:text-success w-full text-xl">{link.text}</a
          >
        </li>
      {/each}
    </ul>
  </aside>
{/if}
