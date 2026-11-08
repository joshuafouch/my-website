<script lang="ts">
  let { data, form } = $props();

  function qrImageSrc(qr: string) {
    if (qr.startsWith('data:') || qr.startsWith('http')) return qr;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`;
  }
</script>

<svelte:head>
  <title>Authenticator</title>
</svelte:head>

<h1>Authenticator</h1>

{#if data.enrolled && !form?.qr}
  <p class="note">An authenticator app is already turned on for this account.</p>
{:else if form?.qr && form.factorId && form.secret}
  <p class="note">Scan this QR code, then enter the 6-digit code to finish setup.</p>

  {#if form.error}
    <p class="error">{form.error}</p>
  {/if}

  <img class="qr" src={qrImageSrc(form.qr)} alt="Authenticator QR code" />
  <p class="note">If you cannot scan it, enter this secret: {form.secret}</p>

  <form method="POST" action="?/confirm">
    <input type="hidden" name="factorId" value={form.factorId} />
    <input type="hidden" name="qr" value={form.qr} />
    <input type="hidden" name="secret" value={form.secret} />
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
      <button class="solid" type="submit">Enable</button>
    </div>
  </form>
{:else}
  <p class="note">Add an authenticator app. After this, signing in will ask for a 6-digit code.</p>
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <form method="POST" action="?/start">
    <div class="bar">
      <button class="solid" type="submit">Set up authenticator</button>
    </div>
  </form>
{/if}

<style>
  .qr {
    display: block;
    width: 14rem;
    margin-top: 1.25rem;
    background: white;
    padding: 0.75rem;
  }
</style>
