<script lang="ts">
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
