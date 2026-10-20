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

<h1 class="font-title mb-2 text-3xl font-bold">Authenticator</h1>

{#if data.enrolled && !form?.qr}
  <p class="font-main opacity-70">An authenticator app is already turned on for this account.</p>
{:else if form?.qr && form.factorId && form.secret}
  <p class="font-main mb-6 opacity-70">
    Scan this QR code, then enter the 6-digit code to finish setup.
  </p>

  <div class="card bg-base-300 space-y-4 p-6 shadow-xl">
    {#if form.error}
      <p class="text-error font-main">{form.error}</p>
    {/if}

    <img class="mx-auto w-56 bg-white p-3" src={qrImageSrc(form.qr)} alt="Authenticator QR code" />
    <p class="font-main text-sm break-all opacity-70">
      If you cannot scan it, enter this secret: {form.secret}
    </p>

    <form method="POST" action="?/confirm" class="space-y-4">
      <input type="hidden" name="factorId" value={form.factorId} />
      <input type="hidden" name="qr" value={form.qr} />
      <input type="hidden" name="secret" value={form.secret} />
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
      <button class="btn btn-primary font-main" type="submit">Enable</button>
    </form>
  </div>
{:else}
  <p class="font-main mb-6 opacity-70">
    Add an authenticator app. After this, signing in will ask for a 6-digit code.
  </p>
  {#if form?.error}
    <p class="text-error font-main mb-4">{form.error}</p>
  {/if}
  <form method="POST" action="?/start">
    <button class="btn btn-primary font-main" type="submit">Set up authenticator</button>
  </form>
{/if}
