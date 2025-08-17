<script lang="ts">
  import { links } from '$lib/config';
  import Sidebar from './Sidebar.svelte';
  
  let isOpen = false;
  let hovering = false;

</script>

<svelte:head>
  <link rel="preload" href="/assets/JF_navlogo_light.webp" as="image" type="image/webp">
  <link rel="preload" href="/assets/JF_navlogo_green.webp" as="image" type="image/webp">
</svelte:head>

<div class="navbar bg-base-100/80 shadow-lg shadow-info font-title 
 lg:rounded-xl rounded-b-xl backdrop-blur-md"
>
  <div class="navbar-start">
    <a 
      class="w-3xs"
      href="/"
      on:mouseenter={() => hovering = true}
      on:mouseleave={() => hovering = false}
    >
      {#if !hovering}
        <img 
          src="/assets/JF_navlogo_light.webp" 
          alt="Logo white"
          class="transition ease-in-out w-3/4"
        >
      {:else}
        <img 
          src="/assets/JF_navlogo_green.webp" 
          alt="Logo green"
          class="transition ease-in-out w-3/4"
        >
      {/if}
    </a>
  </div>

  <!-- on desktop it will show -->
  <div class="navbar-end hidden lg:flex">
    <ul class="menu menu-horizontal px-1 text-xl">
      {#each links as link (link.href)}
        <li class="hover:text-success"><a href={link.href}>{link.text}</a></li>
      {/each}
    </ul>
  </div>

  <!-- shown in mobile-->
  <div class="navbar-end lg:hidden">
    <button aria-label="open menu" class="btn btn-square btn-ghost" on:click={() => (isOpen = true)}>
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
  </div>

</div>

<Sidebar bind:open={isOpen} />
