<script lang="ts">
  import { deserialize } from '$app/forms';
  import { onMount } from 'svelte';
  import type { MusicImage } from '#lib/about.ts';
  import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';

  let {
    images = $bindable(),
    imageId = $bindable(''),
    altDefault = '',
    inUse = () => false,
    open = $bindable(false)
  }: {
    images: MusicImage[];
    imageId: string;
    altDefault?: string;
    inUse?: (id: string) => boolean;
    open?: boolean;
  } = $props();

  let dialog = $state<HTMLDialogElement | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);
  let tab = $state<'upload' | 'library'>('upload');
  let alt = $state('');
  let selected = $state('');
  let preview = $state('');
  let pickerError = $state('');
  let status = $state('');
  let busy = $state(false);
  let dragOver = $state(false);
  let alive = true;
  let previewUrl = '';
  let prepared = $state<File | null>(null);
  let confirmOpen = $state(false);
  let pendingRemoveId = $state('');

  const current = $derived(images.find((image) => image.id === imageId));

  onMount(() => {
    return () => {
      alive = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  });

  function resetPicker() {
    pickerError = '';
    status = '';
    prepared = null;
    setPreview('');
    if (fileInput) fileInput.value = '';
    alt = altDefault.trim();
    selected = imageId;
    tab = images.length ? 'library' : 'upload';
  }

  function openPicker() {
    resetPicker();
    open = true;
    queueMicrotask(() => {
      if (dialog && !dialog.open) dialog.showModal();
    });
  }

  function requestClose() {
    open = false;
    dialog?.close();
  }

  function setPreview(next: string) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = next;
    preview = next;
  }

  function choose(id: string) {
    imageId = id;
    requestClose();
  }

  function useSelected() {
    if (!selected) return;
    choose(selected);
  }

  async function takeFile(file: File | null) {
    prepared = null;
    if (!file) {
      setPreview('');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      pickerError = 'Use a JPEG, PNG, or WebP.';
      setPreview('');
      return;
    }
    pickerError = '';
    status = 'Preparing image…';
    busy = true;
    try {
      const blob = await squareCover(file);
      const type = blob.type || 'image/webp';
      prepared = new File([blob], type.includes('jpeg') ? 'cover.jpg' : 'cover.webp', { type });
      setPreview(URL.createObjectURL(prepared));
    } catch (error) {
      prepared = null;
      setPreview('');
      pickerError = error instanceof Error ? error.message : 'Could not prepare that image.';
    } finally {
      busy = false;
      status = '';
    }
  }

  function onFile(event: Event) {
    void takeFile((event.currentTarget as HTMLInputElement).files?.[0] ?? null);
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function onDragLeave(event: DragEvent) {
    const next = event.relatedTarget;
    const currentTarget = event.currentTarget;
    if (next instanceof Node && currentTarget instanceof Node && currentTarget.contains(next))
      return;
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
    void takeFile(file);
  }

  function actionError(
    result: ReturnType<typeof deserialize>,
    fallback: string,
    statusCode: number
  ): string {
    if (result.type === 'failure' && result.data && typeof result.data.error === 'string') {
      return result.data.error;
    }
    if (statusCode >= 500) return 'Server error. Try again.';
    if (statusCode === 401) return 'Sign in again to manage images.';
    return fallback;
  }

  async function upload() {
    if (!prepared) {
      pickerError = 'Choose an image to upload.';
      return;
    }
    pickerError = '';
    busy = true;
    status = 'Uploading…';
    try {
      const body = new FormData();
      body.set('file', prepared);
      body.set('alt', alt.trim() || altDefault.trim() || 'Album cover');
      const response = await fetch('?/uploadImage', {
        method: 'POST',
        body,
        headers: {
          accept: 'application/json',
          'x-sveltekit-action': 'true'
        }
      });
      const text = await response.text();
      let result: ReturnType<typeof deserialize>;
      try {
        result = deserialize(text);
      } catch {
        pickerError = actionError(
          { type: 'error', status: response.status, error: new Error('bad response') } as never,
          'Could not add that image.',
          response.status
        );
        return;
      }
      if (!alive) return;
      if (result.type !== 'success') {
        pickerError = actionError(result, 'Could not add that image.', response.status);
        return;
      }
      const image = imageFrom(result.data ?? null);
      if (!image) {
        pickerError = 'Upload worked, but the image response was incomplete.';
        return;
      }
      images = [image, ...images.filter((item) => item.id !== image.id)];
      imageId = image.id;
      requestClose();
    } catch (error) {
      pickerError = error instanceof Error ? error.message : 'Could not add that image.';
    } finally {
      busy = false;
      status = '';
    }
  }

  function askRemove(id: string) {
    if (inUse(id)) {
      pickerError = 'Clear this image from every entry before removing it.';
      return;
    }
    pendingRemoveId = id;
    confirmOpen = true;
  }

  async function remove(id: string) {
    pickerError = '';
    busy = true;
    status = 'Removing…';
    try {
      const body = new FormData();
      body.set('id', id);
      const response = await fetch('?/deleteImage', {
        method: 'POST',
        body,
        headers: {
          accept: 'application/json',
          'x-sveltekit-action': 'true'
        }
      });
      const text = await response.text();
      let result: ReturnType<typeof deserialize>;
      try {
        result = deserialize(text);
      } catch {
        pickerError = actionError(
          { type: 'error', status: response.status, error: new Error('bad response') } as never,
          'Could not remove that image.',
          response.status
        );
        return;
      }
      if (result.type !== 'success') {
        pickerError = actionError(result, 'Could not remove that image.', response.status);
        return;
      }
      images = images.filter((image) => image.id !== id);
      if (imageId === id) imageId = '';
      if (selected === id) selected = '';
    } catch {
      pickerError = 'Could not remove that image.';
    } finally {
      busy = false;
      status = '';
    }
  }

  function imageFrom(data: Record<string, unknown> | null | undefined): MusicImage | null {
    if (!data || typeof data.image !== 'object' || !data.image) return null;
    const image = data.image as Record<string, unknown>;
    if (typeof image.id !== 'string' || typeof image.url !== 'string') return null;
    return { id: image.id, url: image.url, alt: typeof image.alt === 'string' ? image.alt : '' };
  }

  async function squareCover(file: File): Promise<Blob> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Use a JPEG, PNG, or WebP.');
    }
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare the image.');
    const side = Math.min(bitmap.width, bitmap.height);
    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      640,
      640
    );
    bitmap.close();
    const webp = await blobOf(canvas, 'image/webp', 0.82);
    if (webp && webp.size > 0) return webp;
    const jpeg = await blobOf(canvas, 'image/jpeg', 0.86);
    if (jpeg && jpeg.size > 0) return jpeg;
    throw new Error('Could not prepare the image.');
  }

  function blobOf(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));
  }
</script>

<div class="pick">
  {#if current}
    <img src={current.url} alt="" />
  {:else}
    <span class="blank">No image</span>
  {/if}
  <div class="row-actions">
    <button type="button" class="solid" onclick={openPicker}>Choose image</button>
    {#if imageId}
      <button type="button" class="text" onclick={() => (imageId = '')}>Clear</button>
    {/if}
  </div>
</div>

<dialog
  bind:this={dialog}
  class="image-dialog font-serif"
  aria-labelledby="music-image-title"
  onclick={(event) => {
    if (event.target === dialog) requestClose();
  }}
  onclose={() => (open = false)}
>
  <header>
    <h2 id="music-image-title">Music cover</h2>
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

    {#if pickerError}
      <p class="error">{pickerError}</p>
    {/if}
    {#if status}
      <p class="note">{status}</p>
    {/if}

    {#if tab === 'upload'}
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
          <span>Drop a JPEG, PNG, or WebP here, or choose a file.</span>
          <span class="limit">Cropped square to 640px · 2 MB max</span>
        {/if}
        <input
          bind:this={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onchange={onFile}
        />
      </label>

      <label class="field">
        <span>Alt text</span>
        <input bind:value={alt} placeholder="Album cover" />
      </label>

      <div class="bar">
        <button class="solid" type="button" disabled={busy || !prepared} onclick={upload}>
          {busy ? 'Uploading…' : 'Upload and use'}
        </button>
      </div>
    {:else}
      {#if images.length === 0}
        <p class="note">No images yet. Upload one and it will show up here.</p>
      {:else}
        <div class="library" role="listbox" aria-label="Saved covers">
          {#each images as image (image.id)}
            <div class="cell">
              <button
                type="button"
                role="option"
                aria-selected={selected === image.id}
                aria-label={image.alt || 'Album cover'}
                onclick={() => (selected = image.id)}
              >
                <img src={image.url} alt="" />
              </button>
              <button
                type="button"
                class="text"
                disabled={busy}
                onclick={() => askRemove(image.id)}>Remove</button
              >
            </div>
          {/each}
        </div>
      {/if}
      <div class="bar">
        <button class="solid" type="button" disabled={!selected} onclick={useSelected}
          >Use cover</button
        >
      </div>
    {/if}
  </div>
</dialog>

<ConfirmDialog
  bind:open={confirmOpen}
  title="Remove image?"
  message="This deletes the cover from the library. Entries using it must be cleared first."
  onconfirm={() => {
    if (pendingRemoveId) void remove(pendingRemoveId);
    pendingRemoveId = '';
  }}
/>

<style>
  .pick {
    display: flex;
    gap: 0.9rem;
    align-items: center;
    margin-top: 1.15rem;
  }

  .pick img,
  .blank {
    width: 4.4rem;
    height: 4.4rem;
    object-fit: cover;
    border: 1px solid color-mix(in oklab, var(--ink) 42%, transparent);
    background: color-mix(in oklab, var(--ground) 68%, var(--ink));
  }

  .blank {
    display: grid;
    place-items: center;
    color: var(--ink-muted);
    font-size: 0.85rem;
    text-align: center;
  }

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
  }

  .library {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
    gap: 0.6rem;
    max-height: 18rem;
    margin-top: 1rem;
    overflow: auto;
  }

  .cell {
    display: grid;
    gap: 0.25rem;
  }

  .cell > button:first-child {
    padding: 0;
    border: 2px solid transparent;
    background: color-mix(in oklab, var(--ground) 68%, var(--ink));
    cursor: pointer;
  }

  .cell > button:first-child[aria-selected='true'] {
    border-color: var(--ink-accent);
  }

  .cell img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }

  .error {
    margin-bottom: 0;
  }
</style>
