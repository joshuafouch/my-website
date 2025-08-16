<script>

  let hovering = false;

  const navLinks = [
    { href: '/', text: 'Home' },
    { href: '/about', text: 'About' },
    { href: '/projects', text: 'Projects' },
    { href: '/blog', text: 'Devblog' },
    { href: '/contact', text: 'Contact' }
  ];
</script>

<svelte:head>
  <link rel="preload" href="/assets/JF_navlogo_light.webp" as="image" type="image/webp">
  <link rel="preload" href="/assets/JF_navlogo_green.webp" as="image" type="image/webp">
</svelte:head>

<div class="navbar bg-base-100/80 shadow-lg font-title 
  rounded-xl backdrop-blur-md"
>
  <div class="navbar-start">
    <a 
      href="/"
      on:mouseenter={() => hovering = true}
      on:mouseleave={() => hovering = false}
    >
      {#if !hovering}
        <img 
          src="/assets/JF_navlogo_light.webp" 
          alt="Logo white"
          class="transition ease-in-out"
        >
      {:else}
        <img 
          src="/assets/JF_navlogo_green.webp" 
          alt="Logo green"
          class="transition ease-in-out"
        >
      {/if}
    </a>
  </div>

  <div class="navbar-end hidden lg:flex">
    <ul class="menu menu-horizontal px-1 text-xl">
      {#each navLinks as link (link.href)}
	      <li class="hover:text-success"><a href={link.href}>{link.text}</a></li>
      {/each}
    </ul>
  </div>

  <div class="navbar-end lg:hidden">
  </div>

</div>
