<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import type { BlogImage } from '#lib/types.ts';

  const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  let {
    mode,
    images,
    imageError = null,
    onuse,
    onclose
  }: {
    mode: 'cover' | 'body' | 'gallery' | 'portrait';
    images: BlogImage[];
    imageError?: string | null;
    onuse: (url: string, alt: string) => void;
    onclose: () => void;
  } = $props();

  let dialog = $state<HTMLDialogElement | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);
  let tab = $state<'upload' | 'library'>('upload');
  let alt = $state('');
  let selected = $state('');
  let preview = $state('');
  let error = $state('');
  let status = $state('');
  let busy = $state(false);
  let dragOver = $state(false);
  let alive = true;
  let previewUrl = '';

  const folder = $derived(
    mode === 'cover' ? 'covers' : mode === 'portrait' ? 'portraits' : 'inline'
  );
  const needsAlt = $derived(mode === 'body' || mode === 'portrait');
  const title = $derived(
    mode === 'cover'
      ? 'Cover image'
      : mode === 'gallery'
        ? 'Gallery image'
        : mode === 'portrait'
          ? 'Portrait image'
          : 'Insert an image'
  );
  const confirmLabel = $derived(
    mode === 'cover'
      ? 'Use as cover'
      : mode === 'gallery'
        ? 'Use in gallery'
        : mode === 'portrait'
          ? 'Use portrait'
          : 'Insert'
  );
  const uploadLabel = $derived(
    mode === 'cover'
      ? 'Upload and use as cover'
      : mode === 'gallery'
        ? 'Upload and use in gallery'
        : mode === 'portrait'
          ? 'Upload and use portrait'
          : 'Upload and insert'
  );

  onMount(() => {
    const el = dialog;
    if (!el) return;
    el.showModal();
    const handleClose = () => {
      if (alive) onclose();
    };
    el.addEventListener('close', handleClose);
    return () => {
      alive = false;
      el.removeEventListener('close', handleClose);
      if (el.open) el.close();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  });

  function requestClose() {
    dialog?.close();
  }

  function setPreview(next: string) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = next;
    preview = next;
  }

  function rejectFile(message: string) {
    error = message;
    setPreview('');
    if (fileInput) fileInput.value = '';
  }

  function takeFile(file: File | null) {
    if (!file) {
      setPreview('');
      return;
    }
    if (!ACCEPTED.has(file.type)) {
      rejectFile('Use a JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      rejectFile('Image must be 5 MB or smaller.');
      return;
    }
    error = '';
    setPreview(URL.createObjectURL(file));
  }

  function onFile(event: Event) {
    takeFile((event.currentTarget as HTMLInputElement).files?.[0] ?? null);
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function onDragLeave(event: DragEvent) {
    const next = event.relatedTarget;
    const current = event.currentTarget;
    if (next instanceof Node && current instanceof Node && current.contains(next)) return;
    dragOver = false;
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    const file = event.dataTransfer?.files?.[0] ?? null;
    if (!file || !fileInput) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    takeFile(file);
  }

  function useSelected() {
    if (!selected) return;
    onuse(selected, alt);
  }
</script>

<dialog
  bind:this={dialog}
  class="image-dialog font-serif"
  aria-labelledby="image-picker-title"
  onclick={(event) => {
    if (event.target === dialog) requestClose();
  }}
>
  <header>
    <h2 id="image-picker-title">{title}</h2>
    <button class="preview-close" type="button" onclick={requestClose}>Close</button>
  </header>

  <div class="panel">
    <div class="tabs" role="tablist" aria-label="Image source">
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'upload'}
        onclick={() => (tab = 'upload')}>Upload</button
      >
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'library'}
        onclick={() => (tab = 'library')}>Library</button
      >
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}
    {#if status}
      <p class="note">{status}</p>
    {/if}

    {#if tab === 'upload'}
      <form
        method="POST"
        action="?/upload"
        enctype="multipart/form-data"
        use:enhance={({ cancel, formData }) => {
          const file = formData.get('file');
          if (!(file instanceof File) || file.size === 0) {
            error = 'Choose an image to upload.';
            cancel();
            return;
          }
          if (!ACCEPTED.has(file.type)) {
            error = 'Use a JPEG, PNG, WebP, or GIF.';
            cancel();
            return;
          }
          if (file.size > MAX_IMAGE_BYTES) {
            error = 'Image must be 5 MB or smaller.';
            cancel();
            return;
          }
          error = '';
          busy = true;
          status = 'Uploading...';
          return async ({ result }) => {
            if (!alive) return;
            busy = false;
            status = '';
            if (result.type === 'success' && result.data && typeof result.data.url === 'string') {
              onuse(result.data.url, alt);
              return;
            }
            if (result.type === 'failure') {
              error = String(result.data?.error ?? 'Upload failed.');
              return;
            }
            error = 'Upload failed.';
          };
        }}
      >
        <input type="hidden" name="folder" value={folder} />
        <label
          class="drop"
          class:over={dragOver}
          ondragover={onDragOver}
          ondragleave={onDragLeave}
          ondrop={onDrop}
        >
          {#if preview}
            <img src={preview} alt="" />
          {:else}
            <span>Drop a JPEG, PNG, WebP, or GIF here, or choose a file.</span>
            <span class="limit">5 MB max</span>
          {/if}
          <input
            bind:this={fileInput}
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onchange={onFile}
          />
        </label>

        {#if needsAlt}
          <label class="field">
            <span>Alt text</span>
            <input bind:value={alt} placeholder="Describe the image" />
          </label>
        {/if}

        <div class="bar">
          <button class="solid" type="submit" disabled={busy}>
            {uploadLabel}
          </button>
        </div>
      </form>
    {:else}
      {#if imageError}
        <p class="error">{imageError}</p>
      {/if}
      {#if images.length === 0}
        <p class="note">No images yet. Upload one and it will show up here.</p>
      {:else}
        <div class="library" role="listbox" aria-label="Saved images">
          {#each images as item (item.url)}
            <button
              type="button"
              role="option"
              aria-selected={selected === item.url}
              aria-label={item.name}
              onclick={() => (selected = item.url)}
            >
              <img src={item.url} alt="" />
            </button>
          {/each}
        </div>
      {/if}

      {#if needsAlt}
        <label class="field">
          <span>Alt text</span>
          <input bind:value={alt} placeholder="Describe the image" />
        </label>
      {/if}

      <div class="bar">
        <button class="solid" type="button" disabled={!selected} onclick={useSelected}>
          {confirmLabel}
        </button>
      </div>
    {/if}
  </div>
</dialog>

<style>
  dialog {
    width: min(36rem, calc(100vw - 2rem));
    max-height: min(88svh, 44rem);
    margin: auto;
    overflow: auto;
    padding: 0;
    border: 1px solid var(--card-border);
    background: var(--dialog-bg);
    color: var(--ink);
  }

  dialog::backdrop {
    background: var(--dialog-backdrop);
  }

  header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1rem;
    background: var(--dialog-bar);
  }

  h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 500;
  }

  .panel {
    padding: 0.35rem 1rem 1.25rem;
  }

  .tabs {
    display: flex;
    gap: 1.25rem;
    font-size: 1.15rem;
    font-variant: small-caps;
    letter-spacing: 0.12em;
  }

  .tabs button {
    padding: 0 0 0.15rem;
    border: 0;
    border-bottom: 1px solid transparent;
    background: none;
    color: var(--ink-muted);
    font: inherit;
    cursor: pointer;
  }

  .tabs button[aria-selected='true'] {
    border-bottom-color: var(--ink-accent);
    color: var(--ink);
  }

  .tabs button:focus-visible {
    color: var(--ink-accent);
    outline: none;
  }

  .drop {
    position: relative;
    display: grid;
    place-items: center;
    gap: 0.35rem;
    min-height: 9rem;
    margin-top: 1rem;
    padding: 1rem;
    border: 1px dashed color-mix(in oklab, var(--ink) 42%, transparent);
    background: color-mix(in oklab, var(--ground) 68%, var(--ink));
    color: var(--ink-muted);
    text-align: center;
    cursor: pointer;
  }

  .drop.over,
  .drop:focus-within {
    border-color: var(--ink-accent);
    color: var(--ink);
  }

  .drop img {
    display: block;
    max-width: 100%;
    max-height: 14rem;
    object-fit: contain;
  }

  .drop input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .limit {
    font-size: 0.95rem;
    letter-spacing: 0.04em;
  }

  .library {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
    gap: 0.6rem;
    max-height: 18rem;
    margin-top: 1rem;
    overflow: auto;
  }

  .library button {
    padding: 0;
    border: 2px solid transparent;
    background: color-mix(in oklab, var(--ground) 68%, var(--ink));
    cursor: pointer;
  }

  .library button[aria-selected='true'] {
    border-color: var(--ink-accent);
  }

  .library button:focus-visible {
    border-color: var(--ink-accent);
    outline: none;
  }

  .library img {
    display: block;
    width: 100%;
    height: 5.5rem;
    object-fit: cover;
  }

  .error {
    margin-bottom: 0;
  }
</style>
