<script>
  let hovering = false;

  const navLinks = [
    { href: '/about', text: 'About' },
    { href: '/projects', text: 'Projects' },
    { href: '/blog', text: 'Devblog' },
    { href: '/contact', text: 'Contact' }
  ];
</script>

svelte:<svelte:head>
  <link rel="preload" href="/assets/JF_navlogo_light.webp" as="image" type="image/webp">
  <link rel="preload" href="/assets/JF_navlogo_green.webp" as="image" type="image/webp">
</svelte:head>

<div class="navbar bg-base-100 shadow-sm font-title fixed top-0 z-50 w-full">
  <div class="flex-1">
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
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1 text-xl">
      {#each navLinks as link (link.href)}
	<li class="hover:text-success"><a href={link.href}>{link.text}</a></li>
      {/each}
    </ul>
  </div>
</div>
