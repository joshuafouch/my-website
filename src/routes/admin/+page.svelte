<script lang="ts">
  import { resolve } from '$app/paths';
  import { title } from '#lib/config.ts';

  const groups = [
    {
      label: 'Content',
      items: [
        {
          href: resolve('/admin/blog'),
          name: 'Blog',
          meta: 'Write, edit, and publish posts'
        },
        {
          href: resolve('/admin/projects'),
          name: 'Projects',
          meta: 'Manage project cards and writeups'
        },
        {
          href: resolve('/admin/about/professional/intro'),
          name: 'Professional',
          meta: 'Intro, portraits, work, and tech'
        },
        {
          href: resolve('/admin/about/personal'),
          name: 'Personal',
          meta: 'Personal about page and music'
        },
        {
          href: resolve('/admin/resume'),
          name: 'Resume',
          meta: 'Upload and replace the resume PDF'
        }
      ]
    },
    {
      label: 'Tools',
      items: [
        {
          href: resolve('/admin/analytics'),
          name: 'Traffic',
          meta: 'Anonymous visitors, pages, countries'
        },
        {
          href: resolve('/admin/vercel'),
          name: 'Vercel',
          meta: 'Deployments and free Speed Insights'
        },
        {
          href: resolve('/admin/supabase'),
          name: 'Supabase',
          meta: 'Database, disk, and bucket usage'
        },
        {
          href: resolve('/admin/storage'),
          name: 'Storage',
          meta: 'Browse, upload, and safely delete unused media'
        },
        {
          href: resolve('/admin/mfa'),
          name: 'Authenticator',
          meta: 'Manage two-factor authentication'
        }
      ]
    }
  ] as const;
</script>

<svelte:head>
  <title>Admin</title>
</svelte:head>

<header class="head admin-hub-head">
  <div>
    <h1>Welcome, {title}</h1>
    <p class="note">Choose where you want to work.</p>
  </div>
</header>

<div class="admin-hub">
  {#each groups as group (group.label)}
    <section class="admin-hub-group" aria-labelledby="hub-{group.label}">
      <h2 id="hub-{group.label}">{group.label}</h2>
      <ul class="index admin-hub-index">
        {#each group.items as item (item.href)}
          <li>
            <a href={item.href}>
              <span>
                <span class="name">{item.name}</span>
                <span class="meta">{item.meta}</span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>
