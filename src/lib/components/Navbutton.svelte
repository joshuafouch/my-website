<script lang="ts">
  import Sidebar from './Sidebar.svelte';

  let isOpen = false;
</script>

<button
  class="btn btn-circle bg-secondary text-base-100
         shadow-base-300 fixed bottom-4 right-4
         p-1 border-2 shadow-lg lg:hidden z-50"
  aria-label="open menu"
  on:click={() => (isOpen = true)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    class="inline-block h-9 w-9 stroke-current"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M4 6h16M4 12h16M4 18h16"
    ></path>
  </svg>
</button>

<Sidebar bind:open={isOpen} />
