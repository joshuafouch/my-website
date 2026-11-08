<script lang="ts">
  let { form } = $props();
</script>

<svelte:head>
  <title>Admin login</title>
</svelte:head>

<h1>Admin login</h1>
<p class="note">Sign in to edit posts, projects, and the about page.</p>

<form method="POST">
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  <label class="field">
    <span>Email</span>
    <input type="email" name="email" autocomplete="username" required value={form?.email ?? ''} />
  </label>

  <label class="field">
    <span>Password</span>
    <input type="password" name="password" autocomplete="current-password" required />
  </label>

  <div class="bar">
    <button class="solid" type="submit">Sign in</button>
  </div>
</form>
