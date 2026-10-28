<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { untrack } from 'svelte';
  import type { Job } from '#lib/about.ts';
  import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
  import MarkdownField from '#lib/components/MarkdownField.svelte';
  import ProfessionalAbout from '#lib/components/ProfessionalAbout.svelte';
  import { openLinks } from '#lib/links.ts';
  import { renderMarkdown } from '#lib/markdown.ts';

  type JobDraft = {
    id: string;
    role: string;
    timeSpan: string;
    body: string;
    skillsText: string;
    orgs: { name: string; href: string }[];
  };

  let {
    workIntro: initialIntro = '',
    jobs: initialJobs = [],
    error = '',
    saved = false
  }: {
    workIntro?: string;
    jobs?: Job[];
    error?: string;
    saved?: boolean;
  } = $props();

  let workIntro = $state(untrack(() => initialIntro));
  let jobs = $state<JobDraft[]>(
    untrack(() =>
      initialJobs.map((job) => ({
        id: job.id,
        role: job.role,
        timeSpan: job.timeSpan,
        body: job.body,
        skillsText: job.skills.join(', '),
        orgs: job.orgs.map((org) => ({ ...org }))
      }))
    )
  );
  let dialog = $state<HTMLDialogElement>();
  let leaveDialog = $state<HTMLDialogElement | null>(null);
  let leaving = $state(false);
  let pendingHref: string | null = null;
  let pendingForm: HTMLFormElement | null = null;
  let previewJobs = $state<Job[]>([]);
  let confirmOpen = $state(false);
  let confirmTitle = $state('Remove?');
  let confirmMessage = $state('');
  let confirmAction = $state<(() => void) | null>(null);

  function askRemove(title: string, message: string, action: () => void) {
    confirmTitle = title;
    confirmMessage = message;
    confirmAction = action;
    confirmOpen = true;
  }

  const start = untrack(() => JSON.stringify({ workIntro, jobs }));
  const dirty = $derived(JSON.stringify({ workIntro, jobs }) !== start);

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= jobs.length) return;
    const copy = [...jobs];
    const [item] = copy.splice(index, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    jobs = copy;
  }

  async function openPreview() {
    previewJobs = await Promise.all(
      jobs
        .filter((job) => job.role.trim())
        .map(async (job) => ({
          id: job.id,
          role: job.role.trim(),
          timeSpan: job.timeSpan.trim(),
          body: job.body.trim()
            ? openLinks(await renderMarkdown(job.body.trim()))
            : '',
          skills: job.skillsText
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean),
          orgs: job.orgs.filter((org) => org.name.trim())
        }))
    );
    if (dialog && !dialog.open) dialog.showModal();
  }

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

  <form method="POST" action="?/save">
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <input type="hidden" name="jobs" value={JSON.stringify(jobs)} />

    <label class="field">
      <span>Section introduction</span>
      <input name="workIntro" bind:value={workIntro} />
    </label>

    {#each jobs as job, index (job.id)}
      <div class="block">
        <label class="field">
          <span>Role</span>
          <input bind:value={job.role} />
        </label>
        <label class="field">
          <span>When</span>
          <input bind:value={job.timeSpan} placeholder="Fall 2026 – Present" />
        </label>
        <div class="field body-field">
          <label for={`job-body-${job.id}`}>Description</label>
          <MarkdownField id={`job-body-${job.id}`} rows={6} bind:value={job.body} />
        </div>
        <label class="field">
          <span>Skills</span>
          <input bind:value={job.skillsText} placeholder="C++, Mentoring" />
        </label>
        {#each job.orgs as org, orgIndex (`${job.id}-${orgIndex}`)}
          <div class="pair">
            <label class="field">
              <span>Organization</span>
              <input bind:value={org.name} />
            </label>
            <label class="field">
              <span>Website</span>
              <input bind:value={org.href} placeholder="https://" />
            </label>
            <button
              type="button"
              class="text"
              onclick={() =>
                askRemove(
                  'Remove organization?',
                  'This organization will be dropped from the role when you save.',
                  () => {
                    job.orgs = job.orgs.filter((_, item) => item !== orgIndex);
                  }
                )}>Remove</button
            >
          </div>
        {/each}
        <div class="row-actions">
          <button type="button" onclick={() => (job.orgs = [...job.orgs, { name: '', href: '' }])}
            >Add organization</button
          >
          <button type="button" onclick={() => move(index, -1)}>Up</button>
          <button type="button" onclick={() => move(index, 1)}>Down</button>
          <button
            type="button"
            onclick={() =>
              askRemove('Remove role?', 'This work entry will be dropped when you save.', () => {
                jobs = jobs.filter((item) => item.id !== job.id);
              })}>Remove</button
          >
        </div>
      </div>
    {/each}

    <div class="bar">
      <button
        type="button"
        class="solid"
        onclick={() =>
          (jobs = [
            {
              id: crypto.randomUUID(),
              role: '',
              timeSpan: '',
              body: '',
              skillsText: '',
              orgs: []
            },
            ...jobs
          ])}>Add work</button
      >
      <button class="solid" type="submit">Save work</button>
      <button class="solid" type="button" onclick={openPreview}>Preview</button>
    </div>
  </form>

  <ConfirmDialog
    bind:open={confirmOpen}
    title={confirmTitle}
    message={confirmMessage}
    onconfirm={() => {
      confirmAction?.();
      confirmAction = null;
    }}
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
        {workIntro}
        techIntro=""
        portraits={[]}
        jobs={previewJobs}
        groups={[]}
      />
    </div>
  </dialog>

  <dialog class="leave" bind:this={leaveDialog} aria-labelledby="leave-title" onclose={stay}>
    <h2 id="leave-title">Leave without saving?</h2>
    <p>Work changes have not been saved.</p>
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
