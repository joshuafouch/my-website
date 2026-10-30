<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { untrack } from 'svelte';
  import type { Portrait } from '#lib/about.ts';
  import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
  import ImagePicker from '#lib/components/ImagePicker.svelte';
  import type { BlogImage } from '#lib/types.ts';

  let {
    portraits: initial = [],
    images = [],
    imageError = null,
    error = '',
    saved = false
  }: {
    portraits?: Portrait[];
    images?: BlogImage[];
    imageError?: string | null;
    error?: string;
    saved?: boolean;
  } = $props();

  let portraits = $state<Portrait[]>(
    untrack(() => initial.map((portrait) => ({ ...portrait })))
  );
  let library = $state<BlogImage[]>(untrack(() => images));
  let pickerOpen = $state(false);
  let activeId = $state('');
  let leaveDialog = $state<HTMLDialogElement | null>(null);
  let leaving = $state(false);
  let pendingHref: string | null = null;
  let pendingForm: HTMLFormElement | null = null;
  let confirmOpen = $state(false);
  let confirmMessage = $state('');
  let confirmAction = $state<(() => void) | null>(null);

  const start = untrack(() => JSON.stringify(portraits));
  const dirty = $derived(JSON.stringify(portraits) !== start);

  function askRemove(message: string, action: () => void) {
    confirmMessage = message;
    confirmAction = action;
    confirmOpen = true;
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= portraits.length) return;
    const copy = [...portraits];
    const [item] = copy.splice(index, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    portraits = copy;
  }

  function openPicker(id: string) {
    activeId = id;
    pickerOpen = true;
  }

  function useImage(url: string, alt: string) {
    if (!library.some((item) => item.url === url)) {
      library = [{ url, name: url.split('/').pop() || 'image', folder: 'portraits' }, ...library];
    }
    portraits = portraits.map((portrait) =>
      portrait.id === activeId
        ? { ...portrait, src: url, alt: alt.trim() || portrait.alt }
        : portrait
    );
    pickerOpen = false;
  }

  function keepsDraft(navigation: { type: string; event?: Event | null }) {
    if (navigation.type !== 'form') return false;
    const formEl = navigation.event?.target;
    if (!(formEl instanceof HTMLFormElement)) return false;
    const action = formEl.getAttribute('action') ?? '';
    return action === '?/save' || action === '?/upload';
  }

  function stay() {
    if (leaving) return;
    pendingHref = null;
    pendingForm = null;
    leaveDialog?.close();
  }

  function confirmLeave() {
    const href = pendingHref;
    const formEl = pendingForm;
    pendingHref = null;
    pendingForm = null;
    leaving = true;
    leaveDialog?.close();
    if (formEl) {
      formEl.requestSubmit();
      return;
    }
    if (href) window.location.assign(href);
  }

  function rememberLeave(navigation: {
    type: string;
    event?: Event | null;
    to: { url: URL } | null;
  }) {
    const formEl = navigation.event?.target;
    if (navigation.type === 'form' && formEl instanceof HTMLFormElement) {
      pendingForm = formEl;
      pendingHref = null;
      return;
    }
    pendingForm = null;
    pendingHref = navigation.to?.url.href ?? null;
  }

  beforeNavigate((navigation) => {
    if (!dirty || leaving || keepsDraft(navigation) || navigation.willUnload) return;
    rememberLeave(navigation);
    if (!pendingHref && !pendingForm) return;
    navigation.cancel();
    if (!leaveDialog?.open) leaveDialog?.showModal();
  });
</script>

<div class="post-editor studio-editor">
  {#if saved}
    <p class="ok">Saved. The about page is updated.</p>
  {/if}

  <form method="POST" action="?/save">
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <input type="hidden" name="portraits" value={JSON.stringify(portraits)} />
    <p class="note">Portraits show beside the introduction. Upload or pick from the library.</p>

    {#each portraits as portrait, index (portrait.id)}
      <div class="cover-card portrait-row">
        {#if portrait.src}
          <img class="thumb" src={portrait.src} alt="" />
        {:else}
          <div class="cover-empty">No image</div>
        {/if}
        <div>
          <label class="field">
            <span>Alt text</span>
            <input bind:value={portrait.alt} />
          </label>
          <div class="bar">
            <button type="button" class="solid" onclick={() => openPicker(portrait.id)}
              >Choose image</button
            >
            <button type="button" class="text" onclick={() => move(index, -1)}>Up</button>
            <button type="button" class="text" onclick={() => move(index, 1)}>Down</button>
            <button
              type="button"
              class="text"
              onclick={() =>
                askRemove('This portrait will be dropped when you save.', () => {
                  portraits = portraits.filter((item) => item.id !== portrait.id);
                })}>Remove</button
            >
          </div>
        </div>
      </div>
    {/each}

    <div class="bar">
      <button
        type="button"
        class="solid"
        onclick={() =>
          (portraits = [...portraits, { id: crypto.randomUUID(), src: '', alt: '' }])}
        >Add portrait</button
      >
      <button class="solid" type="submit">Save portraits</button>
    </div>
  </form>

  {#if pickerOpen}
    <ImagePicker
      mode="portrait"
      images={library}
      {imageError}
      onuse={useImage}
      onclose={() => (pickerOpen = false)}
    />
  {/if}

  <ConfirmDialog
    bind:open={confirmOpen}
    title="Remove portrait?"
    message={confirmMessage}
    onconfirm={() => {
      confirmAction?.();
      confirmAction = null;
    }}
  />

  <dialog class="leave" bind:this={leaveDialog} aria-labelledby="leave-title" onclose={stay}>
    <h2 id="leave-title">Leave without saving?</h2>
    <p>Portrait changes have not been saved.</p>
    <div class="bar">
      <button type="button" class="solid" onclick={stay}>Keep editing</button>
      <button type="button" class="text" onclick={confirmLeave}>Leave</button>
    </div>
  </dialog>
</div>

<svelte:window
  onbeforeunload={(event) => {
    if (!dirty || leaving) return;
    event.preventDefault();
  }}
/>

<style>
  .portrait-row {
    grid-template-columns: 7rem minmax(0, 1fr);
  }

  .thumb,
  .portrait-row .cover-empty {
    width: 7rem;
    height: 7rem;
    border-radius: 9999px;
    object-fit: cover;
  }

  .leave {
    width: min(28rem, calc(100vw - 2rem));
    margin: auto;
    padding: 1.25rem 1.35rem 1.35rem;
    border: 1px solid var(--card-border);
    background: var(--dialog-bg);
    color: var(--ink);
  }

  .leave::backdrop {
    background: var(--dialog-backdrop);
  }

  .leave h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 500;
  }

  .leave p {
    margin: 0.8rem 0 0;
    color: var(--ink-muted);
    font-size: 1.2rem;
    line-height: 1.4;
  }

  .leave .bar {
    margin-top: 1.25rem;
  }
</style>
