<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  let { data, children } = $props();

  let menu = $state(false);

  const section = $derived.by(() => {
    const path = page.url.pathname;
    if (path === '/admin') return 'home';
    if (path.startsWith('/admin/blog')) return 'posts';
    if (path.startsWith('/admin/projects')) return 'projects';
    if (path.startsWith('/admin/about/personal')) return 'personal';
    if (path.startsWith('/admin/about')) return 'professional';
    if (path.startsWith('/admin/resume')) return 'resume';
    return '';
  });

  const wide = $derived(/^\/admin\/(blog|projects)\/[^/]+$/.test(page.url.pathname));

  const links = $derived([
    { href: resolve('/admin'), label: 'Home', current: section === 'home' },
    { href: resolve('/admin/blog'), label: 'Blog', current: section === 'posts' },
    { href: resolve('/admin/projects'), label: 'Projects', current: section === 'projects' },
    {
      href: resolve('/admin/about/professional'),
      label: 'Professional',
      current: section === 'professional'
    },
    { href: resolve('/admin/about/personal'), label: 'Personal', current: section === 'personal' },
    { href: resolve('/admin/resume'), label: 'Resume', current: section === 'resume' },
    {
      href: resolve('/admin/mfa'),
      label: 'Authenticator',
      current: page.url.pathname.startsWith('/admin/mfa')
    }
  ]);

  const here = $derived(links.find((link) => link.current)?.label ?? 'Admin');

  $effect(() => {
    if (page.url.pathname) menu = false;
  });
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === 'Escape') menu = false;
  }}
/>

<div class="studio font-serif" class:wide>
  {#if data.isAdmin}
    <nav class="admin-nav" class:open={menu} aria-label="Admin">
      {#if !data.needsMfa}
        <button
          type="button"
          class="menu-btn"
          aria-expanded={menu}
          aria-controls="admin-links"
          onclick={() => (menu = !menu)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {#if menu}
              <path
                d="M6 6l12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            {:else}
              <path
                d="M4 7h16M4 12h16M4 17h16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            {/if}
          </svg>
          <span>{here}</span>
        </button>
        <ul id="admin-links">
          {#each links as link (link.href)}
            <li>
              <a
                class="quiet-link"
                href={link.href}
                aria-current={link.current ? 'page' : undefined}
                onclick={() => (menu = false)}>{link.label}</a
              >
            </li>
          {/each}
        </ul>
      {/if}
      <form method="POST" action="/admin/logout">
        <button class="text" type="submit">Log out</button>
      </form>
    </nav>
  {/if}

  {@render children()}
</div>
