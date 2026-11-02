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

  const targetMeta = $derived(data.targets.find((entry) => entry.id === target) ?? data.targets[0]);

  const items = $derived(
    data.items.filter((item) => {
      if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
      if (usageFilter === 'used' && item.references.length === 0) return false;
      if (usageFilter === 'unused' && item.references.length > 0) return false;
      return true;
    })
  );

  const kinds = [
    { id: 'all', label: 'All' },
    { id: 'blog-covers', label: 'Covers' },
    { id: 'blog-inline', label: 'Inline' },
    { id: 'blog-portraits', label: 'Portraits' },
    { id: 'music', label: 'Music' },
    { id: 'resume', label: 'Resume' },
    { id: 'background', label: 'Backgrounds' }
  ];

  function kindLabel(kind: string) {
    return kinds.find((entry) => entry.id === kind)?.label ?? kind;
  }
</script>

<svelte:head>
  <title>Storage</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Storage</h1>
    <p class="note">
      Browse buckets, upload into the right place, and delete only files with zero site references.
      Backgrounds are view-only.
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

<section class="obs-panel storage-upload">
  <h2>Upload</h2>
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
    <p class="note">{targetMeta.hint}</p>
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
</section>

<section class="storage-filters" aria-label="Filters">
  <label>
    Kind
    <select bind:value={kindFilter}>
      {#each kinds as kind (kind.id)}
        <option value={kind.id}>{kind.label}</option>
      {/each}
    </select>
  </label>
  <label>
    Usage
    <select bind:value={usageFilter}>
      <option value="all">All</option>
      <option value="unused">Unused only</option>
      <option value="used">Used only</option>
    </select>
  </label>
  <p class="note">{items.length} shown</p>
</section>

<ul class="storage-grid">
  {#each items as item (item.id)}
    <li class:unused={item.references.length === 0 && item.kind !== 'background'}>
      {#if item.kind === 'resume'}
        <div class="storage-thumb storage-thumb-file" aria-hidden="true">PDF</div>
      {:else}
        <img class="storage-thumb" src={item.url} alt="" loading="lazy" />
      {/if}
      <div class="storage-body">
        <p class="name">{item.name}</p>
        <p class="meta">
          {kindLabel(item.kind)}
          {#if item.bucket}
            · {item.bucket}/{item.path}
          {:else}
            · {item.path}
          {/if}
          {#if item.bytes != null}
            · {formatBytes(item.bytes)}
          {/if}
        </p>
        {#if item.references.length}
          <ul class="storage-refs">
            {#each item.references as ref (ref.kind + ref.label + (ref.detail ?? ''))}
              <li>
                <span class="storage-badge">{ref.kind}</span>
                {ref.label}
                {#if ref.detail}
                  <span class="meta">{ref.detail}</span>
                {/if}
              </li>
            {/each}
          </ul>
        {:else}
          <p class="ok">Unused — safe to delete after confirm.</p>
        {/if}
        {#if item.readonlyReason && !item.deletable}
          <p class="note">{item.readonlyReason}</p>
        {/if}
        {#if item.deletable}
          <button class="text danger" type="button" onclick={() => (pendingDelete = item)}
            >Delete</button
          >
        {/if}
      </div>
    </li>
  {:else}
    <li class="note">No files match these filters.</li>
  {/each}
</ul>

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
