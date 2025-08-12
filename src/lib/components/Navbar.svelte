<script>
  const navLinks = [
    { href: "/about", text: "About" },
    { href: "/portfolio", text: "Portfolio" },
    { href: "/blog", text: "Blog" },
    { href: "/contact", text: "Contact" },
  ];
</script>

<div class="navbar bg-base-100 shadow-sm">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost text-xl">Joshua Fouch</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      {#each navLinks as link (link.href)}
        <li><a href={link.href} class="text-lg">{link.text}</a></li>
      {/each}
    </ul>
  </div>
</div>
