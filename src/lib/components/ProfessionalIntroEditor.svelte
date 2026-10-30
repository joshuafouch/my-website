<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { untrack } from 'svelte';
  import MarkdownField from '#lib/components/MarkdownField.svelte';
  import ProfessionalAbout from '#lib/components/ProfessionalAbout.svelte';
  import { openLinks } from '#lib/links.ts';
  import { renderMarkdown } from '#lib/markdown.ts';

  let {
    intro: initialIntro = '',
    error = '',
    saved = false
  }: {
    intro?: string;
    error?: string;
    saved?: boolean;
  } = $props();

  let intro = $state(untrack(() => initialIntro));
  let introHtml = $state('');
  let view = $state<'write' | 'preview'>('write');
  let leaveDialog = $state<HTMLDialogElement | null>(null);
  let leaving = $state(false);
  let pendingHref: string | null = null;
  let pendingForm: HTMLFormElement | null = null;

  const start = untrack(() => intro);
  const dirty = $derived(intro !== start);

  $effect(() => {
    const source = intro;
    let stale = false;
    const timer = setTimeout(
      async () => {
        const rendered = source.trim() ? await renderMarkdown(source) : '';
        if (!stale) introHtml = openLinks(rendered);
      },
      introHtml ? 200 : 0
    );
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  });

  function keepsDraft(navigation: { type: string; event?: Event | null }) {
    if (navigation.type !== 'form') return false;
    const formEl = navigation.event?.target;
    if (!(formEl instanceof HTMLFormElement)) return false;
    return (formEl.getAttribute('action') ?? '') === '?/save';
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
      <form method="POST" action="?/save">
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <div class="field body-field tall">
          <div class="body-label">
            <label for="professional-intro">Who you are professionally</label>
          </div>
          <MarkdownField id="professional-intro" name="intro" rows={14} bind:value={intro} />
          <p class="note">Markdown links work, like [Alaska Railroad](https://example.com/).</p>
        </div>
        <div class="bar">
          <button class="solid" type="submit">Save introduction</button>
        </div>
      </form>
    </div>

    <aside class="split-preview" aria-label="Live preview">
      <div class="preview-copy font-serif">
        <ProfessionalAbout
          {introHtml}
          workIntro=""
          techIntro=""
          portraits={[]}
          jobs={[]}
          groups={[]}
        />
      </div>
    </aside>
  </div>

  <dialog class="leave" bind:this={leaveDialog} aria-labelledby="leave-title" onclose={stay}>
    <h2 id="leave-title">Leave without saving?</h2>
    <p>This introduction has not been saved. Leaving now discards what you've written.</p>
    <div class="bar">
      <button type="button" class="solid" onclick={stay}>Keep writing</button>
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
