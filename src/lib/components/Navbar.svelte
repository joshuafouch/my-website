<script>
	const navLinks = [
		{ href: '/about', text: 'About' },
		{ href: '/portfolio', text: 'Portfolio' },
		{ href: '/blog', text: 'Blog' },
		{ href: '/contact', text: 'Contact' }
	];
</script>

<div class="navbar bg-base-100 shadow-sm">
	<!-- Logo/Title on the left -->
	<div class="navbar-start">
		<a href="/" class="btn btn-ghost text-xl">Joshua Fouch</a>
	</div>

	<!-- Desktop Menu: Hidden on small screens, visible on large screens -->
	<!-- The `hidden` class hides it by default, `lg:flex` makes it visible on large screens and up. -->
	<div class="navbar-end hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			{#each navLinks as link (link.href)}
				<li><a href={link.href} class="text-lg">{link.text}</a></li>
			{/each}
		</ul>
	</div>

	<div class="drawer navbar-end lg:hidden">
		<input id="my-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content">
			<!-- Page content here -->
			<label for="my-drawer" class="btn btn-dash drawer-button"> 💩 </label>
		</div>
		<div class="drawer-side">
			<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
			<ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
				<!-- Sidebar content here -->
				<li><a href="https://www.fortnite.com/?lang=en-US" target="_blank">link to funny game!</a></li>
				<li><a href="https://omgsymbol.com/poop-emojis/" target="_blank">Sidebar Item #2</a></li>
			</ul>
		</div>
	</div>
</div>
