<script lang="ts">
  import { deserialize } from '$app/forms';
  import type { MusicImage } from '#lib/about.ts';

  let {
    images = $bindable(),
    imageId = $bindable(''),
    altDefault = '',
    inUse = () => false
  }: {
    images: MusicImage[];
    imageId: string;
    altDefault?: string;
    inUse?: (id: string) => boolean;
  } = $props();

  let dialog = $state<HTMLDialogElement>();
  let busy = $state(false);
  let pickerError = $state('');

  const current = $derived(images.find((image) => image.id === imageId));

  function open() {
    pickerError = '';
    if (dialog && !dialog.open) dialog.showModal();
  }

  function close() {
    dialog?.close();
  }

  function choose(id: string) {
    imageId = id;
    close();
  }

  async function onFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    pickerError = '';
    busy = true;
    try {
      const blob = await squareCover(file);
      const body = new FormData();
      body.set('file', new File([blob], 'cover.webp', { type: blob.type }));
      body.set('alt', altDefault.trim() || 'Album cover');
      const response = await fetch('?/uploadImage', { method: 'POST', body });
      const result = deserialize(await response.text());
      if (result.type !== 'success') {
        const message =
          result.type === 'failure' && result.data && typeof result.data.error === 'string'
            ? result.data.error
            : 'Could not add that image.';
        pickerError = message;
        return;
      }
      const image = imageFrom(result.data ?? null);
      if (!image) {
        pickerError = 'Could not add that image.';
        return;
      }
      images = [image, ...images.filter((item) => item.id !== image.id)];
      imageId = image.id;
      close();
    } catch (error) {
      pickerError = error instanceof Error ? error.message : 'Could not add that image.';
    } finally {
      busy = false;
    }
  }

  async function remove(id: string) {
    if (inUse(id)) {
      pickerError = 'Clear this image from every entry before removing it.';
      return;
    }
    pickerError = '';
    busy = true;
    try {
      const body = new FormData();
      body.set('id', id);
      const response = await fetch('?/deleteImage', { method: 'POST', body });
      const result = deserialize(await response.text());
      if (result.type !== 'success') {
        const message =
          result.type === 'failure' && result.data && typeof result.data.error === 'string'
            ? result.data.error
            : 'Could not remove that image.';
        pickerError = message;
        return;
      }
      images = images.filter((image) => image.id !== id);
      if (imageId === id) imageId = '';
    } catch {
      pickerError = 'Could not remove that image.';
    } finally {
      busy = false;
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
    if (webp) return webp;
    const jpeg = await blobOf(canvas, 'image/jpeg', 0.86);
    if (jpeg) return jpeg;
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
    <button type="button" onclick={open}>Choose image</button>
    {#if imageId}
      <button type="button" onclick={() => (imageId = '')}>Clear</button>
    {/if}
  </div>
</div>

<dialog class="picker" bind:this={dialog} onclick={(event) => event.target === dialog && close()}>
  <div class="bar">
    <button type="button" onclick={close}>Close</button>
  </div>
  {#if pickerError}
    <p class="error">{pickerError}</p>
  {/if}
  {#if images.length === 0}
    <p class="hint">No images yet. Add one below.</p>
  {:else}
    <div class="grid">
      {#each images as image (image.id)}
        <div class="cell">
          <button
            type="button"
            aria-pressed={image.id === imageId}
            aria-label={image.alt || 'Album cover'}
            onclick={() => choose(image.id)}
          >
            <img src={image.url} alt="" />
          </button>
          <button type="button" disabled={busy} onclick={() => remove(image.id)}>Remove</button>
        </div>
      {/each}
    </div>
  {/if}
  <label class="field">
    <span>{busy ? 'Adding image…' : 'Add image'}</span>
    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onchange={onFile} />
  </label>
  <p class="hint">
    A new image is cropped square and saved at 640 pixels. Pick one to use it here.
  </p>
</dialog>

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
    border: 1px solid var(--card-border);
    background: var(--surface-raised);
  }

  .blank {
    display: grid;
    place-items: center;
    color: var(--ink-muted);
    font-size: 0.85rem;
    text-align: center;
  }

  .picker {
    width: min(36rem, calc(100vw - 2rem));
    max-height: min(80svh, 42rem);
    overflow: auto;
    margin: auto;
    padding: 0.9rem 1.1rem 1.2rem;
    border: 1px solid var(--card-border);
    background: var(--dialog-bg);
    color: var(--ink);
  }

  .picker::backdrop {
    background: var(--dialog-backdrop);
  }

  .bar {
    display: flex;
    justify-content: flex-end;
  }

  .bar button,
  .cell > button:last-child {
    border: 0;
    background: none;
    color: var(--ink-muted);
    font: inherit;
    cursor: pointer;
  }

  .bar button:hover,
  .bar button:focus-visible,
  .cell > button:last-child:hover,
  .cell > button:last-child:focus-visible {
    color: var(--ink-accent);
    outline: none;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.2rem, 1fr));
    gap: 0.8rem;
    margin-top: 0.8rem;
  }

  .cell > button:first-child {
    display: block;
    width: 100%;
    padding: 0;
    border: 1px solid var(--card-border);
    background: var(--surface-raised);
    cursor: pointer;
  }

  .cell > button:first-child[aria-pressed='true'] {
    outline: 2px solid var(--ink-accent);
    outline-offset: 2px;
  }

  .cell img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }

  .hint {
    margin: 0.8rem 0 0;
    color: var(--ink-muted);
    font-size: 1.05rem;
  }
</style>
