<script lang="ts">
  import { enhance } from '$app/forms';
  import { formatBytes } from '#lib/format-bytes.ts';
  import type { StorageItem, UploadTarget } from '#lib/observability-types.ts';

  let { data, form } = $props();

  let kindFilter = $state('all');
  let usageFilter = $state('all');
  let target = $state<UploadTarget>('blog-covers');
  let pendingDelete = $state<StorageItem | null>(null);
  let uploadBusy = $state(false);
  let deleteBusy = $state(false);
  let selectedId = $state<string | null>(null);

  const targetMeta = $derived(data.targets.find((entry) => entry.id === target) ?? data.targets[0]);

  const kinds = [
    { id: 'all', label: 'All Files' },
    { id: 'blog-covers', label: 'Covers' },
    { id: 'blog-inline', label: 'Inline' },
    { id: 'blog-portraits', label: 'Portraits' },
    { id: 'music', label: 'Music' },
    { id: 'resume', label: 'Resume' },
    { id: 'background', label: 'Backgrounds' }
  ];

  const items = $derived(
    data.items.filter((item) => {
      if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
      if (usageFilter === 'used' && item.references.length === 0) return false;
      if (usageFilter === 'unused' && item.references.length > 0) return false;
      return true;
    })
  );

  const selected = $derived(items.find((item) => item.id === selectedId) ?? items[0] ?? null);

  const locationLabel = $derived(
    kinds.find((entry) => entry.id === kindFilter)?.label ?? 'All Files'
  );

  function kindLabel(kind: string) {
    return kinds.find((entry) => entry.id === kind)?.label ?? kind;
  }

  function selectItem(item: StorageItem) {
    selectedId = item.id;
  }

  $effect(() => {
    if (selectedId && !items.some((item) => item.id === selectedId)) {
      selectedId = items[0]?.id ?? null;
    }
  });
</script>

<svelte:head>
  <title>Storage</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Storage</h1>
    <p class="note">
      Browse buckets like a file explorer. Upload into the right place, and delete only files with
      zero site references. Backgrounds are view-only.
    </p>
  </div>
</header>

{#if form?.error}
  <p class="error">{form.error}</p>
{/if}
{#if form?.ok && form.message}
  <p class="ok">{form.message}</p>
{/if}
{#if data.error}
  <p class="error">{data.error}</p>
{/if}

<div class="storage-explorer">
  <aside class="storage-sidebar" aria-label="Folders">
    <p class="storage-sidebar-label">Locations</p>
    <ul class="storage-folder-list">
      {#each kinds as kind (kind.id)}
        <li>
          <button
            type="button"
            class="storage-folder"
            class:active={kindFilter === kind.id}
            aria-current={kindFilter === kind.id ? 'true' : undefined}
            onclick={() => (kindFilter = kind.id)}
          >
            <span class="storage-folder-icon" aria-hidden="true"></span>
            <span>{kind.label}</span>
          </button>
        </li>
      {/each}
    </ul>

    <p class="storage-sidebar-label">Usage</p>
    <ul class="storage-folder-list">
      <li>
        <button
          type="button"
          class="storage-folder"
          class:active={usageFilter === 'all'}
          aria-current={usageFilter === 'all' ? 'true' : undefined}
          onclick={() => (usageFilter = 'all')}>All</button
        >
      </li>
      <li>
        <button
          type="button"
          class="storage-folder"
          class:active={usageFilter === 'unused'}
          aria-current={usageFilter === 'unused' ? 'true' : undefined}
          onclick={() => (usageFilter = 'unused')}>Unused only</button
        >
      </li>
      <li>
        <button
          type="button"
          class="storage-folder"
          class:active={usageFilter === 'used'}
          aria-current={usageFilter === 'used' ? 'true' : undefined}
          onclick={() => (usageFilter = 'used')}>Used only</button
        >
      </li>
    </ul>
  </aside>

  <div class="storage-main">
    <div class="storage-toolbar">
      <div class="storage-path">
        <span class="storage-path-root">Storage</span>
        <span aria-hidden="true">/</span>
        <span>{locationLabel}</span>
        <span class="meta">{items.length} items</span>
      </div>
    </div>

    <section class="storage-upload" aria-label="Upload">
      <form
        method="POST"
        action="?/upload"
        enctype="multipart/form-data"
        class="storage-upload-form"
        use:enhance={() => {
          uploadBusy = true;
          return async ({ update }) => {
            uploadBusy = false;
            await update();
          };
        }}
      >
        <label class="field">
          <span>Destination</span>
          <select name="target" bind:value={target}>
            {#each data.targets as option (option.id)}
              <option value={option.id}>{option.label}</option>
            {/each}
          </select>
        </label>
        {#if target === 'music'}
          <label class="field">
            <span>Alt text</span>
            <input name="alt" type="text" maxlength="160" placeholder="Album cover" />
          </label>
        {/if}
        <label class="field">
          <span>File</span>
          <input name="file" type="file" accept={targetMeta.accept} required />
        </label>
        <button class="solid" type="submit" disabled={uploadBusy}
          >{uploadBusy ? 'Uploading…' : 'Upload'}</button
        >
      </form>
      <p class="note">{targetMeta.hint}</p>
    </section>

    <div class="storage-pane">
      <div class="storage-list-wrap" role="region" aria-label="Files">
        <div class="storage-list-head" aria-hidden="true">
          <span></span>
          <span>Name</span>
          <span>Kind</span>
          <span>Size</span>
          <span>Status</span>
        </div>
        <ul class="storage-list">
          {#each items as item (item.id)}
            <li>
              <button
                type="button"
                class="storage-row"
                class:selected={selected?.id === item.id}
                class:unused={item.references.length === 0 && item.kind !== 'background'}
                aria-current={selected?.id === item.id ? 'true' : undefined}
                onclick={() => selectItem(item)}
              >
                {#if item.kind === 'resume'}
                  <span class="storage-thumb storage-thumb-file" aria-hidden="true">PDF</span>
                {:else}
                  <img class="storage-thumb" src={item.url} alt="" loading="lazy" />
                {/if}
                <span class="storage-row-name">{item.name}</span>
                <span class="storage-row-kind">{kindLabel(item.kind)}</span>
                <span class="storage-row-size"
                  >{item.bytes != null ? formatBytes(item.bytes) : '—'}</span
                >
                <span class="storage-row-status">
                  {#if item.references.length === 0 && item.kind !== 'background'}
                    Unused
                  {:else if item.references.length}
                    {item.references.length} ref{item.references.length === 1 ? '' : 's'}
                  {:else}
                    Read-only
                  {/if}
                </span>
              </button>
            </li>
          {:else}
            <li class="storage-empty note">No files match these filters.</li>
          {/each}
        </ul>
      </div>

      <aside class="storage-preview" aria-label="File details">
        {#if selected}
          {#if selected.kind === 'resume'}
            <div class="storage-preview-media storage-thumb-file" aria-hidden="true">PDF</div>
          {:else}
            <img class="storage-preview-media" src={selected.url} alt="" />
          {/if}
          <h2>{selected.name}</h2>
          <p class="meta">
            {kindLabel(selected.kind)}
            {#if selected.bucket}
              · {selected.bucket}/{selected.path}
            {:else}
              · {selected.path}
            {/if}
            {#if selected.bytes != null}
              · {formatBytes(selected.bytes)}
            {/if}
          </p>

          {#if selected.references.length}
            <ul class="storage-refs">
              {#each selected.references as ref (ref.kind + ref.label + (ref.detail ?? ''))}
                <li>
                  <span class="storage-badge">{ref.kind}</span>
                  {ref.label}
                  {#if ref.detail}
                    <span class="meta">{ref.detail}</span>
                  {/if}
                </li>
              {/each}
            </ul>
          {:else if selected.kind !== 'background'}
            <p class="ok">Unused — safe to delete after confirm.</p>
          {/if}

          {#if selected.readonlyReason && !selected.deletable}
            <p class="note">{selected.readonlyReason}</p>
          {/if}

          {#if selected.deletable}
            <button class="text danger" type="button" onclick={() => (pendingDelete = selected)}
              >Delete</button
            >
          {/if}
        {:else}
          <p class="note">Select a file to inspect it.</p>
        {/if}
      </aside>
    </div>
  </div>
</div>

<svelte:window
  onkeydown={(event) => {
    if (event.key === 'Escape' && pendingDelete) pendingDelete = null;
  }}
/>

{#if pendingDelete}
  <div class="storage-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
    <div class="storage-modal-card">
      <h2 id="delete-title">Are you sure?</h2>
      <p>
        Delete <strong>{pendingDelete.name}</strong>? This only works because it has no remaining
        references on the site.
      </p>
      <form
        method="POST"
        action="?/delete"
        use:enhance={() => {
          deleteBusy = true;
          return async ({ update, result }) => {
            deleteBusy = false;
            await update();
            if (result.type === 'success') pendingDelete = null;
          };
        }}
      >
        <input type="hidden" name="id" value={pendingDelete.id} />
        <input type="hidden" name="confirm" value="yes" />
        <div class="storage-modal-actions">
          <button class="text" type="button" onclick={() => (pendingDelete = null)}>Cancel</button>
          <button class="solid danger" type="submit" disabled={deleteBusy}
            >{deleteBusy ? 'Deleting…' : 'Yes, delete'}</button
          >
        </div>
      </form>
    </div>
  </div>
{/if}
