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

	<!-- Mobile Dropdown Menu: Visible only on small screens -->
	<!-- The `lg:hidden` class hides this entire section on large screens. -->
	<div class="navbar-end lg:hidden">
		<div class="dropdown dropdown-end">
			<!-- The hamburger button that triggers the dropdown -->
			<div tabindex="0" role="button" class="btn btn-ghost">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h7"
					/>
				</svg>
			</div>
			<!-- The dropdown menu content -->
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
			>
				{#each navLinks as link (link.href)}
					<li><a href={link.href}>{link.text}</a></li>
				{/each}
			</ul>
		</div>
	</div>
</div>
