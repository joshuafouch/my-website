<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import './admin.css';

  let { data, children } = $props();

  const atHome = $derived(page.url.pathname === '/admin');

  const wide = $derived(
    /^\/admin\/(blog|projects)\/[^/]+$/.test(page.url.pathname) ||
      /^\/admin\/about\/(professional(\/|$)|personal)/.test(page.url.pathname) ||
      page.url.pathname.startsWith('/admin/resume') ||
      page.url.pathname.startsWith('/admin/analytics') ||
      page.url.pathname.startsWith('/admin/vercel') ||
      page.url.pathname.startsWith('/admin/supabase') ||
      page.url.pathname.startsWith('/admin/storage')
  );
</script>

<div class="studio font-serif" class:wide>
  {#if data.isAdmin}
    <nav class="admin-chrome" aria-label="Admin">
      <div class="admin-chrome-start">
        {#if !atHome && !data.needsMfa}
          <a class="quiet-link admin-back" href={resolve('/admin')}>← Back to admin</a>
        {:else}
          <span class="admin-mark">Admin</span>
        {/if}
      </div>
      <form method="POST" action="/admin/logout">
        <button class="text" type="submit">Log out</button>
      </form>
    </nav>
  {/if}

  {@render children()}
</div>
