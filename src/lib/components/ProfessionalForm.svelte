<script lang="ts">
  import { marked } from 'marked';
  import { untrack } from 'svelte';
  import type { Portrait, ProfessionalContent, TechGroup } from '#lib/about.ts';
  import { openLinks } from '#lib/links.ts';
  import ProfessionalAbout from '#lib/components/ProfessionalAbout.svelte';

  type JobDraft = {
    id: string;
    role: string;
    timeSpan: string;
    body: string;
    skillsText: string;
    orgs: { name: string; href: string }[];
  };

  let {
    content,
    error = '',
    saved = false
  }: {
    content: ProfessionalContent;
    error?: string;
    saved?: boolean;
  } = $props();

  let intro = $state(untrack(() => content.intro));
  let workIntro = $state(untrack(() => content.workIntro));
  let techIntro = $state(untrack(() => content.techIntro));
  let portraits = $state<Portrait[]>(
    untrack(() => content.portraits.map((portrait) => ({ ...portrait })))
  );
  let jobs = $state<JobDraft[]>(
    untrack(() =>
      content.jobs.map((job) => ({
        id: job.id,
        role: job.role,
        timeSpan: job.timeSpan,
        body: job.body,
        skillsText: job.skills.join(', '),
        orgs: job.orgs.map((org) => ({ ...org }))
      }))
    )
  );
  let groups = $state<TechGroup[]>(
    untrack(() =>
      content.groups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item }))
      }))
    )
  );
  let dialog = $state<HTMLDialogElement>();
  let introHtml = $state('');
  let portraitsPreview = $state<Portrait[]>([]);

  const previewJobs = $derived(
    jobs
      .filter((job) => job.role.trim())
      .map((job) => ({
        id: job.id,
        role: job.role.trim(),
        timeSpan: job.timeSpan.trim(),
        body: job.body.trim(),
        skills: job.skillsText
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        orgs: job.orgs.filter((org) => org.name.trim())
      }))
  );
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

  function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
    const next = index + direction;
    if (next < 0 || next >= list.length) return list;
    const copy = [...list];
    const [item] = copy.splice(index, 1);
    if (!item) return list;
    copy.splice(next, 0, item);
    return copy;
  }

  async function openPreview() {
    const rendered = intro.trim() ? await marked.parse(intro) : '';
    introHtml = openLinks(String(rendered));
    portraitsPreview = portraits.flatMap((portrait) => {
      const input = document.querySelector<HTMLInputElement>(
        `input[name="portrait-${portrait.id}"]`
      );
      const file = input?.files?.[0];
      const src = file ? URL.createObjectURL(file) : portrait.src.trim();
      if (!src) return [];
      return [{ id: portrait.id, src, alt: portrait.alt.trim() }];
    });
    if (dialog && !dialog.open) dialog.showModal();
  }

  function closePreview() {
    dialog?.close();
  }

  function onDialogClose() {
    for (const portrait of portraitsPreview) {
      if (portrait.src.startsWith('blob:')) URL.revokeObjectURL(portrait.src);
    }
  }
</script>

<form method="POST" enctype="multipart/form-data">
  {#if error}
    <p class="error">{error}</p>
  {/if}
  {#if saved}
    <p class="ok">Saved. The about page is updated.</p>
  {/if}
  <p class="note">Saving updates the live page. Preview checks the look before you save.</p>

  <input type="hidden" name="portraits" value={JSON.stringify(portraits)} />
  <input type="hidden" name="jobs" value={JSON.stringify(jobs)} />
  <input type="hidden" name="groups" value={JSON.stringify(groups)} />

  <section class="editor">
    <h2>Introduction</h2>
    <label class="field">
      <span>Who you are professionally</span>
      <textarea name="intro" rows="6" bind:value={intro}></textarea>
    </label>
    <p class="note">
      Markdown links work, like [Alaska Railroad](https://www.alaskarailroad.com/).
    </p>
  </section>

  <section class="editor">
    <h2>Portraits</h2>
    {#each portraits as portrait, index (portrait.id)}
      <div class="block">
        <label class="field">
          <span>Image path or URL</span>
          <input bind:value={portrait.src} placeholder="/assets/joshportraits/joshpfp1.jpg" />
        </label>
        {#if portrait.src}
          <img class="thumb" src={portrait.src} alt="" />
        {/if}
        <label class="field">
          <span>Or upload</span>
          <input type="file" name={`portrait-${portrait.id}`} accept="image/*" />
        </label>
        <label class="field">
          <span>Alt text</span>
          <input bind:value={portrait.alt} />
        </label>
        <div class="row-actions">
          <button type="button" onclick={() => (portraits = move(portraits, index, -1))}>Up</button>
          <button type="button" onclick={() => (portraits = move(portraits, index, 1))}>Down</button
          >
          <button
            type="button"
            onclick={() => (portraits = portraits.filter((item) => item.id !== portrait.id))}
            >Remove</button
          >
        </div>
      </div>
    {/each}
    <div class="bar">
      <button
        type="button"
        class="solid"
        onclick={() => (portraits = [...portraits, { id: crypto.randomUUID(), src: '', alt: '' }])}
        >Add portrait</button
      >
    </div>
  </section>

  <section class="editor">
    <h2>Work</h2>
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
        <label class="field">
          <span>Description</span>
          <textarea rows="4" bind:value={job.body}></textarea>
        </label>
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
              onclick={() => (job.orgs = job.orgs.filter((_, item) => item !== orgIndex))}
              >Remove</button
            >
          </div>
        {/each}
        <div class="row-actions">
          <button type="button" onclick={() => (job.orgs = [...job.orgs, { name: '', href: '' }])}
            >Add organization</button
          >
          <button type="button" onclick={() => (jobs = move(jobs, index, -1))}>Up</button>
          <button type="button" onclick={() => (jobs = move(jobs, index, 1))}>Down</button>
          <button type="button" onclick={() => (jobs = jobs.filter((item) => item.id !== job.id))}
            >Remove</button
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
            { id: crypto.randomUUID(), role: '', timeSpan: '', body: '', skillsText: '', orgs: [] },
            ...jobs
          ])}>Add work</button
      >
    </div>
  </section>

  <section class="editor">
    <h2>Tech stack</h2>
    <label class="field">
      <span>Section introduction</span>
      <input name="techIntro" bind:value={techIntro} />
    </label>
    {#each groups as group, index (group.id)}
      <div class="block">
        <label class="field">
          <span>Group</span>
          <input bind:value={group.title} />
        </label>
        {#each group.items as item, itemIndex (`${group.id}-${itemIndex}`)}
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
              onclick={() => (group.items = group.items.filter((_, entry) => entry !== itemIndex))}
              >Remove</button
            >
          </div>
        {/each}
        <div class="row-actions">
          <button
            type="button"
            onclick={() => (group.items = [...group.items, { text: '', href: '' }])}
            >Add technology</button
          >
          <button type="button" onclick={() => (groups = move(groups, index, -1))}>Up</button>
          <button type="button" onclick={() => (groups = move(groups, index, 1))}>Down</button>
          <button
            type="button"
            onclick={() => (groups = groups.filter((item) => item.id !== group.id))}>Remove</button
          >
        </div>
      </div>
    {/each}
    <div class="bar">
      <button
        type="button"
        class="solid"
        onclick={() => (groups = [...groups, { id: crypto.randomUUID(), title: '', items: [] }])}
        >Add group</button
      >
    </div>
  </section>

  <div class="bar">
    <button class="solid" type="submit">Save</button>
    <button class="solid" type="button" onclick={openPreview}>Preview</button>
  </div>
</form>

<dialog
  class="preview-dialog"
  bind:this={dialog}
  onclick={(event) => event.target === dialog && closePreview()}
  onclose={onDialogClose}
>
  <div class="preview-bar">
    <button class="preview-close" type="button" onclick={closePreview}>Close</button>
  </div>
  <div class="preview-copy font-serif">
    <ProfessionalAbout
      {introHtml}
      {workIntro}
      {techIntro}
      portraits={portraitsPreview}
      jobs={previewJobs}
      groups={previewGroups}
    />
  </div>
</dialog>

<style>
  .thumb {
    display: block;
    width: 5rem;
    height: 5rem;
    margin-top: 0.75rem;
    border-radius: 9999px;
    object-fit: cover;
  }
</style>
