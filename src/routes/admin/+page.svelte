<script lang="ts">
  import { resolve } from '$app/paths';
  import { title } from '#lib/config.ts';
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
  <li>
    <a href={resolve('/admin/analytics')}>
      <span>
        <span class="name">Traffic</span>
        <span class="meta">Anonymous visitors, pages, countries</span>
      </span>
    </a>
  </li>
  <li>
    <a href={resolve('/admin/vercel')}>
      <span>
        <span class="name">Vercel</span>
        <span class="meta">Deployments and free Speed Insights</span>
      </span>
    </a>
  </li>
  <li>
    <a href={resolve('/admin/supabase')}>
      <span>
        <span class="name">Supabase</span>
        <span class="meta">Database, disk, and bucket usage</span>
      </span>
    </a>
  </li>
  <li>
    <a href={resolve('/admin/storage')}>
      <span>
        <span class="name">Storage</span>
        <span class="meta">Browse, upload, and safely delete unused media</span>
      </span>
    </a>
  </li>
</ul>
