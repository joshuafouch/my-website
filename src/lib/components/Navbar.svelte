<script lang="ts">
  import { links } from '$lib/config';
  import Sidebar from './Sidebar.svelte';

  let isHidden = false;
  let windowWidth = 0;
  let isOpen = false;
  let lastScrollY = 0;

  function handleScroll() {
    const currentScrollY = window.scrollY;
      // will remove nav at threshold and will show if scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        isHidden = true; // scrolling down
      } else {
        isHidden = false; // scrolling up
      }
    lastScrollY = currentScrollY;
  }

</script>

<svelte:window on:scroll={handleScroll} bind:innerWidth={windowWidth} />

<svelte:head>
  <link rel="preload" href="/assets/JF_navlogo_light.webp" as="image" type="image/webp" />
  <link rel="preload" href="/assets/JF_navlogo_green.webp" as="image" type="image/webp" />
</svelte:head>

<div
  class="navbar bg-base-300/80 shadow-info font-title shadow-lg
  backdrop-blur-md rounded-b-xl
  transition-transform duration duration-400"
  class:-translate-y-full={isHidden}
>
  <div class="navbar-start">
    <a class="group relative w-3xs" href="/">
      <img
        src="/assets/JF_navlogo_light.webp"
        alt="Logo white"
        class="w-3/4"
      />
      <img
        src="/assets/JF_navlogo_green.webp"
        alt="Logo green"
        class="w-3/4 absolute top-0 left-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
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

<Sidebar bind:open={isOpen} />
