<script lang="ts">
  let { form } = $props();
</script>

<svelte:head>
  <title>Admin login</title>
</svelte:head>

<h1 class="font-title mb-2 text-3xl font-bold">Admin login</h1>
<p class="font-main mb-6 opacity-70">Sign in with your Supabase account to write posts.</p>

<form method="POST" class="card bg-base-300 space-y-4 p-6 shadow-xl">
  {#if form?.error}
    <p class="text-error font-main">{form.error}</p>
  {/if}

  <label class="font-main block space-y-1">
    <span>Email</span>
    <input
      class="input input-bordered w-full"
      type="email"
      name="email"
      autocomplete="username"
      required
      value={form?.email ?? ''}
    />
  </label>

  <label class="font-main block space-y-1">
    <span>Password</span>
    <input
      class="input input-bordered w-full"
      type="password"
      name="password"
      autocomplete="current-password"
      required
    />
  </label>

  <button class="btn btn-primary font-main" type="submit">Sign in</button>
</form>
