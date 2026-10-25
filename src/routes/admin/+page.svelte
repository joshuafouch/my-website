<script lang="ts">
  import { resolve } from '$app/paths';
  import { title } from '#lib/config.ts';

  const choices = [
    { href: resolve('/admin/blog'), name: 'Blog', meta: 'Write and publish posts' },
    { href: resolve('/admin/projects'), name: 'Projects', meta: 'Add and edit projects' },
    {
      href: resolve('/admin/about/professional'),
      name: 'Professional',
      meta: 'Intro, work, and technologies'
    },
    { href: resolve('/admin/about/personal'), name: 'Personal', meta: 'Intro, video, and music' },
    { href: resolve('/admin/resume'), name: 'Resume', meta: 'Upload a new PDF' },
    { href: resolve('/admin/mfa'), name: 'Authenticator', meta: 'Two-factor sign-in' }
  ];
</script>

<svelte:head>
  <title>Admin</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Welcome, {title}</h1>
    <p class="note">What would you like to do?</p>
  </div>
</header>

<ul class="index">
  {#each choices as choice (choice.href)}
    <li>
      <a href={choice.href}>
        <span>
          <span class="name">{choice.name}</span>
          <span class="meta">{choice.meta}</span>
        </span>
      </a>
    </li>
  {/each}
</ul>
