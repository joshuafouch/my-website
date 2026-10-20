<script lang="ts">
  let { form } = $props();
</script>

<svelte:head>
  <title>Authenticator code</title>
</svelte:head>

<h1 class="font-title mb-2 text-3xl font-bold">Authenticator code</h1>
<p class="font-main mb-6 opacity-70">Enter the 6-digit code from your authenticator app.</p>

<form method="POST" class="card bg-base-300 space-y-4 p-6 shadow-xl">
  {#if form?.error}
    <p class="text-error font-main">{form.error}</p>
  {/if}

  <label class="font-main block space-y-1">
    <span>Code</span>
    <input
      class="input input-bordered w-full tracking-[0.4em]"
      name="code"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern={'[0-9]{6}'}
      minlength="6"
      maxlength="6"
      required
    />
  </label>

  <button class="btn btn-primary font-main" type="submit">Verify</button>
</form>
