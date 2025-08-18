<script lang="ts">
  import { links } from '$lib/config';
  import Sidebar from './Sidebar.svelte';

  let isOpen = false;
  let hovering = false;
</script>

<svelte:head>
  <link rel="preload" href="/assets/JF_navlogo_light.webp" as="image" type="image/webp" />
  <link rel="preload" href="/assets/JF_navlogo_green.webp" as="image" type="image/webp" />
</svelte:head>

<div
  class="navbar bg-base-100/80 shadow-info font-title hidden rounded-b-xl shadow-lg
 backdrop-blur-md lg:flex lg:rounded-xl"
>
  <div class="navbar-start">
    <a
      class="w-3xs"
      href="/"
      on:mouseenter={() => (hovering = true)}
      on:mouseleave={() => (hovering = false)}
    >
      {#if !hovering}
        <img
          src="/assets/JF_navlogo_light.webp"
          alt="Logo white"
          class="w-3/4 transition ease-in-out"
        />
      {:else}
        <img
          src="/assets/JF_navlogo_green.webp"
          alt="Logo green"
          class="w-3/4 transition ease-in-out"
        />
      {/if}
    </a>
  </div>

  <!-- on desktop it will show -->
  <div class="navbar-end hidden lg:flex">
    <ul class="menu menu-horizontal px-1 text-xl">
      {#each links as link (link.href)}
        <li class="hover:text-success">
          <a href={link.href}>{link.text}</a>
        </li>
      {/each}
    </ul>
  </div>

  <!-- shown in mobile-->
  <div class="navbar-end lg:hidden">
    <button
      aria-label="open menu"
      class="btn btn-square btn-ghost"
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
  </div>
</div>

<button
  class="btn bg-secondary text-base-100
				 shadow-base-300 fixed top-4 right-0
         h-auto rounded-l-lg rounded-r-none
         border-1 px-0
         py-3 shadow-lg"
  aria-label="open menu"
  on:click={() => (isOpen = true)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="10 7 5 10"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-3 w-3"
  >
    <path d="M15 7 L10 12 L15 17"></path>
  </svg>
</button>

<Sidebar bind:open={isOpen} />
