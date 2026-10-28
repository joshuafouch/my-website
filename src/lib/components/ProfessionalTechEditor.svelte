<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { untrack } from 'svelte';
  import type { TechGroup } from '#lib/about.ts';
  import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
  import ProfessionalAbout from '#lib/components/ProfessionalAbout.svelte';

  let {
    techIntro: initialIntro = '',
    groups: initialGroups = [],
    error = '',
    saved = false
  }: {
    techIntro?: string;
    groups?: TechGroup[];
    error?: string;
    saved?: boolean;
  } = $props();

  let techIntro = $state(untrack(() => initialIntro));
  let groups = $state<TechGroup[]>(
    untrack(() =>
      initialGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item }))
      }))
    )
  );
  let selectedId = $state(untrack(() => groups[0]?.id ?? ''));
  let dialog = $state<HTMLDialogElement>();
  let leaveDialog = $state<HTMLDialogElement | null>(null);
  let leaving = $state(false);
  let pendingHref: string | null = null;
  let pendingForm: HTMLFormElement | null = null;

  let confirmOpen = $state(false);
  let confirmTitle = $state('Remove?');
  let confirmMessage = $state('');
  let confirmAction = $state<(() => void) | null>(null);

  const start = untrack(() => JSON.stringify({ techIntro, groups }));
  const dirty = $derived(JSON.stringify({ techIntro, groups }) !== start);
  const selected = $derived(groups.find((group) => group.id === selectedId) ?? null);

  const previewGroups = $derived(
    groups
      .filter((group) => group.title.trim())
      .map((group) => ({
        ...group,
        title: group.title.trim(),
        items: group.items
          .filter((item) => item.text.trim())
          .map((item) => ({ text: item.text.trim(), href: item.href.trim() }))
      }))
  );

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= groups.length) return;
    const copy = [...groups];
    const [item] = copy.splice(index, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    groups = copy;
  }

  function askRemove(title: string, message: string, action: () => void) {
    confirmTitle = title;
    confirmMessage = message;
    confirmAction = action;
    confirmOpen = true;
  }

  function runConfirm() {
    confirmAction?.();
    confirmAction = null;
  }

  function addGroup() {
    const id = crypto.randomUUID();
    groups = [...groups, { id, title: '', items: [] }];
    selectedId = id;
  }

  function keepsDraft(navigation: { type: string; event?: Event | null }) {
    return navigation.type === 'form';
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
    <input type="hidden" name="groups" value={JSON.stringify(groups)} />

    <label class="field">
      <span>Section introduction</span>
      <input name="techIntro" bind:value={techIntro} />
    </label>

    <p class="note">Select a group to edit its technologies. Only one group is open at a time.</p>

    <ul class="entry-list">
      {#each groups as group, index (group.id)}
        <li class="entry-row" class:selected={selectedId === group.id}>
          <button type="button" class="pick-row" onclick={() => (selectedId = group.id)}>
            <span class="meta">
              <strong>{group.title.trim() || 'Untitled group'}</strong>
              <span
                >{group.items.filter((item) => item.text.trim()).length}
                {group.items.filter((item) => item.text.trim()).length === 1
                  ? 'technology'
                  : 'technologies'}</span
              >
            </span>
          </button>
          <div class="row-actions">
            <button type="button" onclick={() => move(index, -1)}>Up</button>
            <button type="button" onclick={() => move(index, 1)}>Down</button>
            <button
              type="button"
              onclick={() =>
                askRemove('Remove group?', 'This tech group will be dropped when you save.', () => {
                  groups = groups.filter((item) => item.id !== group.id);
                  if (selectedId === group.id) selectedId = groups[0]?.id ?? '';
                })}>Remove</button
            >
          </div>
        </li>
      {/each}
    </ul>

    <div class="bar">
      <button type="button" class="solid" onclick={addGroup}>Add group</button>
    </div>

    {#if selected}
      <div class="entry-editor">
        <label class="field">
          <span>Group</span>
          <input bind:value={selected.title} />
        </label>
        {#each selected.items as item, itemIndex (`${selected.id}-${itemIndex}`)}
          <div class="pair">
            <label class="field">
              <span>Name</span>
              <input bind:value={item.text} />
            </label>
            <label class="field">
              <span>Link, if it has one</span>
              <input bind:value={item.href} placeholder="https://" />
            </label>
            <button
              type="button"
              class="text"
              onclick={() =>
                askRemove(
                  'Remove technology?',
                  'This technology will be dropped from the group when you save.',
                  () => {
                    if (!selected) return;
                    selected.items = selected.items.filter((_, entry) => entry !== itemIndex);
                  }
                )}>Remove</button
            >
          </div>
        {/each}
        <div class="row-actions">
          <button
            type="button"
            onclick={() => (selected.items = [...selected.items, { text: '', href: '' }])}
            >Add technology</button
          >
        </div>
      </div>
    {:else}
      <p class="note">Select a group or add one.</p>
    {/if}

    <div class="bar">
      <button class="solid" type="submit">Save tech stack</button>
      <button
        class="solid"
        type="button"
        onclick={() => dialog && !dialog.open && dialog.showModal()}>Preview</button
      >
    </div>
  </form>

  <ConfirmDialog
    bind:open={confirmOpen}
    title={confirmTitle}
    message={confirmMessage}
    onconfirm={runConfirm}
  />

  <dialog
    class="preview-dialog"
    bind:this={dialog}
    onclick={(event) => event.target === dialog && dialog?.close()}
  >
    <div class="preview-bar">
      <button class="preview-close" type="button" onclick={() => dialog?.close()}>Close</button>
    </div>
    <div class="preview-copy font-serif">
      <ProfessionalAbout
        introHtml=""
        workIntro=""
        {techIntro}
        portraits={[]}
        jobs={[]}
        groups={previewGroups}
      />
    </div>
  </dialog>

  <dialog class="leave" bind:this={leaveDialog} aria-labelledby="leave-title" onclose={stay}>
    <h2 id="leave-title">Leave without saving?</h2>
    <p>Tech stack changes have not been saved.</p>
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
  .entry-list {
    display: grid;
    gap: 0.55rem;
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
  }

  .entry-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.6rem;
    align-items: center;
    padding: 0.55rem;
    border: 1px solid color-mix(in oklab, var(--ink) 28%, transparent);
    background: color-mix(in oklab, var(--ground) 82%, var(--ink));
  }

  .entry-row.selected {
    border-color: var(--ink-accent);
    outline: 1px solid color-mix(in oklab, var(--ink-accent) 40%, transparent);
  }

  .pick-row {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .meta {
    display: grid;
    gap: 0.15rem;
    min-width: 0;
  }

  .meta strong {
    font-weight: 500;
  }

  .meta span {
    color: var(--ink-muted);
    font-size: 0.95rem;
  }

  .entry-editor {
    margin-top: 1.15rem;
    padding: 0.85rem;
    border: 1px solid color-mix(in oklab, var(--ink) 42%, transparent);
    background: color-mix(in oklab, var(--ground) 82%, var(--ink));
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
