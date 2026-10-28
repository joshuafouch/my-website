<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { tick, untrack } from 'svelte';
  import ImagePicker from '#lib/components/ImagePicker.svelte';
  import PostPreview from '#lib/components/PostPreview.svelte';
  import MarkdownField from '#lib/components/MarkdownField.svelte';
  import { insertImageMarkdown } from '#lib/insert-image.ts';
  import { openLinks } from '#lib/links.ts';
  import { renderMarkdown } from '#lib/markdown.ts';
  import { slugify } from '#lib/slug.ts';
  import { placeCaret } from '#lib/textarea-caret.ts';
  import type { BlogImage } from '#lib/types.ts';

  type Fields = {
    title?: string;
    slug?: string;
    description?: string;
    date?: string;
    categories?: string;
    image?: string;
    body?: string;
    published?: boolean;
    error?: string;
  };

  type PostFields = {
    title: string;
    slug: string;
    description: string;
    date: string;
    categories: string[];
    image: string | null;
    body: string;
    published: boolean;
  };

  let {
    post = null,
    form = null,
    images = [],
    imageError = null
  }: {
    post?: PostFields | null;
    form?: Fields | null;
    images?: BlogImage[];
    imageError?: string | null;
  } = $props();

  const today = new Date().toISOString().slice(0, 10);
  let title = $state(untrack(() => form?.title ?? post?.title ?? ''));
  let slug = $state(untrack(() => form?.slug ?? post?.slug ?? ''));
  let slugTouched = $state(untrack(() => Boolean(post?.slug || form?.slug)));
  let description = $state(untrack(() => form?.description ?? post?.description ?? ''));
  let date = $state(untrack(() => (form?.date ?? post?.date ?? today).slice(0, 10)));
  let categories = $state(untrack(() => form?.categories ?? post?.categories?.join(', ') ?? ''));
  let image = $state(untrack(() => form?.image ?? post?.image ?? ''));
  let body = $state(untrack(() => form?.body ?? post?.body ?? ''));
  let published = $state(untrack(() => form?.published ?? post?.published ?? false));
  let library = $state<BlogImage[]>(untrack(() => images));
  let previewHtml = $state('');
  let view = $state<'write' | 'preview'>('write');
  let pickerOpen = $state(false);
  let pickerMode = $state<'cover' | 'body'>('body');
  let caret = $state({ start: 0, end: 0 });
  let leaveDialog = $state<HTMLDialogElement | null>(null);
  let leaving = $state(false);
  let pendingHref: string | null = null;
  let pendingForm: HTMLFormElement | null = null;

  const initial = untrack(() => ({
    title,
    slug,
    description,
    date,
    categories,
    image,
    body,
    published
  }));

  const dirty = $derived(
    title !== initial.title ||
      slug !== initial.slug ||
      description !== initial.description ||
      date !== initial.date ||
      categories !== initial.categories ||
      image !== initial.image ||
      body !== initial.body ||
      published !== initial.published
  );

  const previewTags = $derived(
    categories
      .split(',')
      .map((category) => category.trim())
      .filter(Boolean)
  );

  $effect(() => {
    const source = body;
    let stale = false;
    const timer = setTimeout(
      async () => {
        const rendered = source.trim() ? await renderMarkdown(source) : '';
        if (!stale) previewHtml = openLinks(rendered);
      },
      previewHtml ? 200 : 0
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

  function openPicker(next: 'cover' | 'body') {
    if (next === 'body') {
      const area = document.getElementById('post-body') as HTMLTextAreaElement | null;
      caret = {
        start: area?.selectionStart ?? body.length,
        end: area?.selectionEnd ?? body.length
      };
    }
    pickerMode = next;
    pickerOpen = true;
  }

  async function focusCaret(cursor: number) {
    await tick();
    const area = document.getElementById('post-body') as HTMLTextAreaElement | null;
    if (!area) return;
    const settle = () => placeCaret(area, cursor);
    settle();
    requestAnimationFrame(settle);
  }

  function keepsDraft(navigation: { type: string; event?: Event | null }) {
    if (navigation.type !== 'form') return false;
    const form = navigation.event?.target;
    if (!(form instanceof HTMLFormElement)) return false;
    const action = form.getAttribute('action') ?? '';
    return action === '?/save' || action === '?/upload';
  }

  function rememberLeave(navigation: {
    type: string;
    event?: Event | null;
    to: { url: URL } | null;
  }) {
    const form = navigation.event?.target;
    if (navigation.type === 'form' && form instanceof HTMLFormElement) {
      pendingForm = form;
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
    const form = pendingForm;
    pendingHref = null;
    pendingForm = null;
    leaving = true;
    leaveDialog?.close();
    if (form) {
      form.requestSubmit();
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

    const next = insertImageMarkdown(body, caret.start, caret.end, url, alt);
    body = next.body;
    pickerOpen = false;
    void focusCaret(next.cursor);
  }
</script>

<div class="post-editor">
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
        {#if form?.error}
          <p class="error">{form.error}</p>
        {/if}

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
          <span>Description</span>
          <textarea name="description" rows="3" required bind:value={description}></textarea>
        </label>

        <div class="meta-row">
          <label class="field">
            <span>Date</span>
            <input type="date" name="date" required bind:value={date} />
          </label>

          <label class="field">
            <span>Categories</span>
            <input name="categories" placeholder="theology, philosophy" bind:value={categories} />
          </label>
        </div>

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
                <button type="button" class="text" onclick={() => (image = '')}>Remove</button>
              {/if}
            </div>
          </div>
        </div>

        <div class="field body-field">
          <div class="body-label">
            <label for="post-body">Body</label>
            <button type="button" class="solid" onclick={() => openPicker('body')}>Image</button>
          </div>
          <MarkdownField id="post-body" name="body" required rows={18} bind:value={body} />
        </div>

        <label class="check">
          <input type="checkbox" name="published" bind:checked={published} />
          Published
        </label>

        <div class="bar">
          <button class="solid" type="submit">Save post</button>
        </div>
      </form>
    </div>

    <aside class="split-preview" aria-label="Live preview">
      <PostPreview
        compact
        {title}
        {description}
        {date}
        categories={previewTags}
        {image}
        html={previewHtml}
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

  <dialog class="leave" bind:this={leaveDialog} aria-labelledby="leave-title" onclose={stay}>
    <h2 id="leave-title">Leave without saving?</h2>
    <p>This post has not been saved. Leaving now discards what you've written.</p>
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
