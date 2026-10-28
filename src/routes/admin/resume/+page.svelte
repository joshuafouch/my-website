<script lang="ts">
  import { resolve } from '$app/paths';
  import { formatDate } from '#lib/utils.ts';

  let { data, form } = $props();

  let picked = $state('');
  let pickedUrl = $state('');
  let view = $state<'write' | 'preview'>('write');

  const shown = $derived(pickedUrl || data.resume.url);

  function onPick(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (pickedUrl) URL.revokeObjectURL(pickedUrl);
    pickedUrl = file ? URL.createObjectURL(file) : '';
    picked = file?.name ?? '';
    if (file) view = 'preview';
  }
</script>

<svelte:head>
  <title>Resume</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Resume</h1>
    {#if data.saved}
      <p class="ok">Uploaded. The site now uses this resume.</p>
    {/if}
  </div>
  <a class="quiet-link" href={resolve('/resume')}>View on site</a>
</header>

<div class="post-editor studio-editor">
  <div class="split" data-view={view}>
    <div class="split-tabs" role="group" aria-label="Editor view">
      <button type="button" aria-pressed={view === 'write'} onclick={() => (view = 'write')}
        >Write</button
      >
      <button type="button" aria-pressed={view === 'preview'} onclick={() => (view = 'preview')}
        >Preview</button
      >
    </div>

    <div class="split-write">
      <p class="note">
        {#if data.resume.uploaded && data.resume.updatedAt}
          Current file: {data.resume.filename}, uploaded {formatDate(
            data.resume.updatedAt.slice(0, 10)
          )}.
        {:else}
          The site still uses the PDF bundled with the code. Upload one to replace it.
        {/if}
      </p>

      <form method="POST" enctype="multipart/form-data">
        {#if form?.error}
          <p class="error">{form.error}</p>
        {/if}

        <label class="field">
          <span>New resume (PDF, up to 10 MB)</span>
          <input type="file" name="resume" accept="application/pdf" required onchange={onPick} />
        </label>

        <label class="field">
          <span>Download name</span>
          <input name="filename" value={form?.filename ?? data.resume.filename} />
        </label>

        <div class="bar">
          <button class="solid" type="submit">Replace resume</button>
        </div>
      </form>
    </div>

    <aside class="split-preview" aria-label="Resume preview">
      <h2 class="preview-label">{picked ? `Preview: ${picked}` : 'Current resume'}</h2>
      {#if picked}
        <p class="note">Not live yet. Replace resume to publish it.</p>
      {/if}
      {#if shown}
        <iframe class="frame" src={shown} title="Resume preview"></iframe>
      {:else}
        <p class="note">No resume to preview yet.</p>
      {/if}
    </aside>
  </div>
</div>

<style>
  .preview-label {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 500;
  }

  .frame {
    display: block;
    width: 100%;
    height: min(70svh, 42rem);
    margin-top: 1rem;
    border: 1px solid color-mix(in oklab, var(--ink) 42%, transparent);
    background: color-mix(in oklab, var(--ground) 68%, var(--ink));
  }
</style>
