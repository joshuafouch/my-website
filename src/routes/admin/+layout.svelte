<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  let { data, children } = $props();

  const section = $derived.by(() => {
    const path = page.url.pathname;
    if (path.startsWith('/admin/projects')) return 'projects';
    if (path.startsWith('/admin/about/personal')) return 'personal';
    if (path.startsWith('/admin/about')) return 'professional';
    if (path.startsWith('/admin/mfa') || path.startsWith('/admin/login')) return '';
    return 'posts';
  });
</script>

<div class="studio font-serif">
  {#if data.isAdmin}
    <nav aria-label="Admin">
      <ul>
        {#if !data.needsMfa}
          <li>
            <a
              class="quiet-link"
              href={resolve('/admin')}
              aria-current={section === 'posts' ? 'page' : undefined}>Blog</a
            >
          </li>
          <li>
            <a
              class="quiet-link"
              href={resolve('/admin/projects')}
              aria-current={section === 'projects' ? 'page' : undefined}>Projects</a
            >
          </li>
          <li>
            <a
              class="quiet-link"
              href={resolve('/admin/about/professional')}
              aria-current={section === 'professional' ? 'page' : undefined}>Professional</a
            >
          </li>
          <li>
            <a
              class="quiet-link"
              href={resolve('/admin/about/personal')}
              aria-current={section === 'personal' ? 'page' : undefined}>Personal</a
            >
          </li>
          <li class="side">
            <a
              class="quiet-link"
              href={resolve('/admin/mfa')}
              aria-current={page.url.pathname.startsWith('/admin/mfa') ? 'page' : undefined}
              >Authenticator</a
            >
          </li>
        {/if}
        <li>
          <form method="POST" action="/admin/logout">
            <button class="text" type="submit">Log out</button>
          </form>
        </li>
      </ul>
    </nav>
  {/if}

  {@render children()}
</div>
