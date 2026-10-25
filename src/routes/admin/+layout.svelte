<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  let { data, children } = $props();

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
</script>

<div class="studio font-serif" class:wide>
  {#if data.isAdmin}
    <nav aria-label="Admin">
      <ul>
        {#if !data.needsMfa}
          <li>
            <a
              class="quiet-link"
              href={resolve('/admin')}
              aria-current={section === 'home' ? 'page' : undefined}>Home</a
            >
          </li>
          <li>
            <a
              class="quiet-link"
              href={resolve('/admin/blog')}
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
          <li>
            <a
              class="quiet-link"
              href={resolve('/admin/resume')}
              aria-current={section === 'resume' ? 'page' : undefined}>Resume</a
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
