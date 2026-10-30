<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { tick, untrack } from 'svelte';
  import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
  import ImagePicker from '#lib/components/ImagePicker.svelte';
  import MarkdownField from '#lib/components/MarkdownField.svelte';
  import ProjectPreview from '#lib/components/ProjectPreview.svelte';
  import { insertImageMarkdown } from '#lib/insert-image.ts';
  import { openLinks } from '#lib/links.ts';
  import { renderMarkdown } from '#lib/markdown.ts';
  import { slugify } from '#lib/slug.ts';
  import { placeCaret } from '#lib/textarea-caret.ts';
  import type { BlogImage } from '#lib/types.ts';

  type Fields = {
    id?: string;
    title?: string;
    slug?: string;
    description?: string;
    details?: string;
    date?: string;
    image?: string;
    images?: string;
    tags?: string;
    sourceUrl?: string;
    published?: boolean;
    error?: string;
  };

  type ProjectFields = {
    id: string;
    title: string;
    slug: string;
    description: string;
    details: string;
    date: string;
    image: string;
    images: string[];
    tags: string[];
    source_url: string | null;
    published: boolean;
  };

  let {
    project = null,
    form = null,
    images: libraryProp = [],
    imageError = null
  }: {
    project?: ProjectFields | null;
    form?: Fields | null;
    images?: BlogImage[];
    imageError?: string | null;
  } = $props();

  const today = new Date().toISOString().slice(0, 10);
  let title = $state(untrack(() => form?.title ?? project?.title ?? ''));
  let slug = $state(untrack(() => form?.slug ?? project?.slug ?? ''));
  let slugTouched = $state(untrack(() => Boolean(project?.slug || form?.slug)));
  let description = $state(untrack(() => form?.description ?? project?.description ?? ''));
  let details = $state(untrack(() => form?.details ?? project?.details ?? ''));
  let date = $state(untrack(() => (form?.date ?? project?.date ?? today).slice(0, 10)));
  let image = $state(untrack(() => form?.image ?? project?.image ?? ''));
  let gallery = $state<string[]>(
    untrack(() => {
      if (form?.images != null) {
        return form.images
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return project?.images ? [...project.images] : [];
    })
  );
  let tags = $state(untrack(() => form?.tags ?? project?.tags?.join(', ') ?? ''));
  let sourceUrl = $state(untrack(() => form?.sourceUrl ?? project?.source_url ?? ''));
  let published = $state(untrack(() => form?.published ?? project?.published ?? false));
  let library = $state<BlogImage[]>(untrack(() => libraryProp));
  let detailsHtml = $state('');
  let view = $state<'write' | 'preview'>('write');
  let pickerOpen = $state(false);
  let pickerMode = $state<'cover' | 'body' | 'gallery'>('body');
  let caret = $state({ start: 0, end: 0 });
  let leaveDialog = $state<HTMLDialogElement | null>(null);
  let leaving = $state(false);
  let pendingHref: string | null = null;
  let pendingForm: HTMLFormElement | null = null;
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

  const initial = untrack(() => ({
    title,
    slug,
    description,
    details,
    date,
    image,
    gallery: gallery.join('\n'),
    tags,
    sourceUrl,
    published
  }));

  const dirty = $derived(
    title !== initial.title ||
      slug !== initial.slug ||
      description !== initial.description ||
      details !== initial.details ||
      date !== initial.date ||
      image !== initial.image ||
      gallery.join('\n') !== initial.gallery ||
      tags !== initial.tags ||
      sourceUrl !== initial.sourceUrl ||
      published !== initial.published
  );

  const previewTags = $derived(
    tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  );

  $effect(() => {
    const source = details;
    let stale = false;
    const timer = setTimeout(
      async () => {
        const rendered = source.trim() ? await renderMarkdown(source) : '';
        if (!stale) detailsHtml = openLinks(rendered);
      },
      detailsHtml ? 200 : 0
    );
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  });

  function onTitleInput(event: Event) {
    title = (event.currentTarget as HTMLInputElement).value;
    if (!slugTouched) slug = slugify(title);
  }

  function openPicker(next: 'cover' | 'body' | 'gallery') {
    if (next === 'body') {
      const area = document.getElementById('project-details') as HTMLTextAreaElement | null;
      caret = {
        start: area?.selectionStart ?? details.length,
        end: area?.selectionEnd ?? details.length
      };
    }
    pickerMode = next;
    pickerOpen = true;
  }

  async function focusCaret(cursor: number) {
    await tick();
    const area = document.getElementById('project-details') as HTMLTextAreaElement | null;
    if (!area) return;
    const settle = () => placeCaret(area, cursor);
    settle();
    requestAnimationFrame(settle);
  }

  function keepsDraft(navigation: { type: string; event?: Event | null }) {
    if (navigation.type !== 'form') return false;
    const formEl = navigation.event?.target;
    if (!(formEl instanceof HTMLFormElement)) return false;
    const action = formEl.getAttribute('action') ?? '';
    return action === '?/save' || action === '?/upload';
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

  beforeNavigate((navigation) => {
    if (!dirty || leaving || keepsDraft(navigation) || navigation.willUnload) return;
    rememberLeave(navigation);
    if (!pendingHref && !pendingForm) return;
    navigation.cancel();
    if (!leaveDialog?.open) leaveDialog?.showModal();
  });

  function useImage(url: string, alt: string) {
    if (!library.some((item) => item.url === url)) {
      library = [
        {
          url,
          name: url.split('/').pop() || 'image',
          folder: pickerMode === 'cover' ? 'covers' : 'inline'
        },
        ...library
      ];
    }

    if (pickerMode === 'cover') {
      image = url;
      pickerOpen = false;
      return;
    }

    if (pickerMode === 'gallery') {
      if (!gallery.includes(url)) gallery = [...gallery, url];
      pickerOpen = false;
      return;
    }

    const next = insertImageMarkdown(details, caret.start, caret.end, url, alt);
    details = next.body;
    pickerOpen = false;
    void focusCaret(next.cursor);
  }

  function removeGallery(url: string) {
    gallery = gallery.filter((item) => item !== url);
  }
</script>

<div class="post-editor studio-editor">
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
        {#if project}
          <input type="hidden" name="id" value={project.id} />
        {/if}

        {#if form?.error}
          <p class="error">{form.error}</p>
        {/if}
        <p class="note">
          The preview matches the opened card on the projects page. It stays private until you
          publish and save.
        </p>

        <label class="field">
          <span>Title</span>
          <input name="title" required value={title} oninput={onTitleInput} />
        </label>

        <label class="field">
          <span>Slug</span>
          <input
            name="slug"
            required
            value={slug}
            oninput={(event) => {
              slugTouched = true;
              slug = (event.currentTarget as HTMLInputElement).value;
            }}
          />
        </label>

        <label class="field">
          <span>Short description</span>
          <textarea name="description" rows="3" bind:value={description}></textarea>
        </label>

        <div class="meta-row">
          <label class="field">
            <span>Date</span>
            <input type="date" name="date" required bind:value={date} />
          </label>

          <label class="field">
            <span>Tags</span>
            <input name="tags" placeholder="sveltekit, tailwindcss" bind:value={tags} />
          </label>
        </div>

        <label class="field">
          <span>Source URL</span>
          <input name="sourceUrl" bind:value={sourceUrl} placeholder="https://github.com/..." />
        </label>

        <div class="cover-card">
          {#if image}
            <img src={image} alt="" />
          {:else}
            <div class="cover-empty">No cover</div>
          {/if}
          <div>
            <input type="hidden" name="image" value={image} />
            <div class="bar">
              <button type="button" class="solid" onclick={() => openPicker('cover')}
                >Choose image</button
              >
              {#if image}
                <button
                  type="button"
                  class="text"
                  onclick={() =>
                    askRemove('Clear this image?', 'The cover will be cleared until you choose another.', () => {
                      image = '';
                    })}>Remove</button
                >
              {/if}
            </div>
          </div>
        </div>

        <div class="field body-field tall">
          <div class="body-label">
            <label for="project-details">Details</label>
            <button type="button" class="solid" onclick={() => openPicker('body')}>Image</button>
          </div>
          <MarkdownField id="project-details" name="details" rows={18} bind:value={details} />
          <p class="note">Markdown writeup for the opened card. Insert images from the library.</p>
        </div>

        <div class="gallery-card">
          <div class="body-label">
            <span>Gallery images</span>
            <button type="button" class="solid" onclick={() => openPicker('gallery')}
              >Add image</button
            >
          </div>
          <input type="hidden" name="images" value={gallery.join('\n')} />
          {#if gallery.length === 0}
            <p class="note">Optional extras shown after the writeup on the opened card.</p>
          {:else}
            <ul class="gallery-list">
              {#each gallery as src (src)}
                <li>
                  <img {src} alt="" />
                  <button
                    type="button"
                    class="text"
                    onclick={() =>
                      askRemove(
                        'Remove gallery image?',
                        'This image will be removed from the gallery list.',
                        () => removeGallery(src)
                      )}>Remove</button
                  >
                </li>
              {/each}
            </ul>
          {/if}
        </div>

        <label class="check">
          <input type="checkbox" name="published" bind:checked={published} />
          Published
        </label>

        <div class="bar">
          <button class="solid" type="submit">Save project</button>
        </div>
      </form>
    </div>

    <aside class="split-preview narrow" aria-label="Live preview">
      <ProjectPreview
        {title}
        {description}
        detailsHtml={detailsHtml}
        {image}
        images={gallery}
        tags={previewTags}
        {sourceUrl}
      />
    </aside>
  </div>

  {#if pickerOpen}
    <ImagePicker
      mode={pickerMode}
      images={library}
      {imageError}
      onuse={useImage}
      onclose={() => (pickerOpen = false)}
    />
  {/if}

  <ConfirmDialog
    bind:open={confirmOpen}
    title={confirmTitle}
    message={confirmMessage}
    onconfirm={() => {
      confirmAction?.();
      confirmAction = null;
    }}
  />

  <dialog class="leave" bind:this={leaveDialog} aria-labelledby="leave-title" onclose={stay}>
    <h2 id="leave-title">Leave without saving?</h2>
    <p>This project has not been saved. Leaving now discards what you've written.</p>
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
  .gallery-card {
    margin-top: 1.15rem;
    padding: 0.85rem;
    background: color-mix(in oklab, var(--ground) 82%, var(--ink));
    border: 1px solid color-mix(in oklab, var(--ink) 42%, transparent);
  }

  .gallery-list {
    display: grid;
    gap: 0.75rem;
    margin: 0.85rem 0 0;
    padding: 0;
    list-style: none;
  }

  .gallery-list li {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr);
    gap: 0.75rem;
    align-items: center;
  }

  .gallery-list img {
    width: 7rem;
    height: 5rem;
    object-fit: cover;
    border: 1px solid color-mix(in oklab, var(--ink) 42%, transparent);
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
