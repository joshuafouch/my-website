<script lang="ts">
  let { form } = $props();
</script>

<svelte:head>
  <title>Authenticator code</title>
</svelte:head>

<h1>Authenticator code</h1>
<p class="note">Enter the 6-digit code from your authenticator app.</p>

<form method="POST">
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  <label class="field">
    <span>Code</span>
    <input
      name="code"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern={'[0-9]{6}'}
      minlength="6"
      maxlength="6"
      required
    />
  </label>

  <div class="bar">
    <button class="solid" type="submit">Verify</button>
  </div>
</form>
