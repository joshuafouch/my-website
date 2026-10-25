<script lang="ts">
  import { enhance } from '$app/forms';
  import { untrack } from 'svelte';
  import PostPreview from '#lib/components/PostPreview.svelte';
  import { openLinks } from '#lib/links.ts';
  import { renderMarkdown } from '#lib/markdown.ts';
  import { slugify } from '#lib/slug.ts';

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

  let { post = null, form = null }: { post?: PostFields | null; form?: Fields | null } = $props();

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
  let coverPreview = $state('');
  let inlineError = $state('');
  let inlineStatus = $state('');
  let previewHtml = $state('');
  let view = $state<'write' | 'preview'>('write');

  const shownImage = $derived(coverPreview || image);
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

  function onCover(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    coverPreview = file ? URL.createObjectURL(file) : '';
  }

  function insertMarkdown(markdown: string) {
    const area = document.getElementById('post-body') as HTMLTextAreaElement | null;
    const start = area?.selectionStart ?? body.length;
    const end = area?.selectionEnd ?? body.length;
    body = `${body.slice(0, start)}${markdown}${body.slice(end)}`;
  }
</script>

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
    <form method="POST" action="?/save" enctype="multipart/form-data">
      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}
      <p class="note">
        The preview shows the article. It stays private until you publish and save.
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
        <span>Description</span>
        <textarea name="description" rows="3" required bind:value={description}></textarea>
      </label>

      <label class="field">
        <span>Date</span>
        <input type="date" name="date" required bind:value={date} />
      </label>

      <label class="field">
        <span>Categories</span>
        <input name="categories" placeholder="theology, philosophy" bind:value={categories} />
      </label>

      <label class="field">
        <span>Cover image URL</span>
        <input name="image" bind:value={image} placeholder="https://.../blog-images/covers/..." />
      </label>

      <label class="field">
        <span>Replace cover</span>
        <input type="file" name="cover" accept="image/*" onchange={onCover} />
      </label>

      <label class="field body-field">
        <span>Body</span>
        <textarea id="post-body" name="body" required bind:value={body}></textarea>
      </label>

      <label class="check">
        <input type="checkbox" name="published" bind:checked={published} />
        Published
      </label>

      <div class="bar">
        <button class="solid" type="submit">Save post</button>
      </div>
    </form>

    <form
      method="POST"
      action="?/inline"
      enctype="multipart/form-data"
      class="editor"
      use:enhance={() => {
        inlineError = '';
        inlineStatus = 'Uploading...';
        return async ({ result }) => {
          inlineStatus = '';
          if (result.type === 'success' && result.data && 'markdown' in result.data) {
            insertMarkdown(String(result.data.markdown));
            inlineStatus = 'Image inserted into the body.';
            return;
          }
          if (result.type === 'failure') {
            inlineError = String(result.data?.error ?? 'Upload failed.');
          }
        };
      }}
    >
      <h2>Insert an image</h2>
      <p class="note">Uploads the image and places it in the body. Save the post afterward.</p>
      {#if inlineError}
        <p class="error">{inlineError}</p>
      {/if}
      {#if inlineStatus}
        <p class="note">{inlineStatus}</p>
      {/if}
      <label class="field">
        <span>Image</span>
        <input type="file" name="inline" accept="image/*" required />
      </label>
      <label class="field">
        <span>Alt text</span>
        <input name="alt" placeholder="Describe the image" />
      </label>
      <div class="bar">
        <button class="solid" type="submit">Upload and insert</button>
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
      image={shownImage}
      html={previewHtml}
    />
  </aside>
</div>
