<script lang="ts">
  import { enhance } from '$app/forms';
  import { untrack } from 'svelte';
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
  let body = $state(untrack(() => form?.body ?? post?.body ?? ''));
  let inlineError = $state('');
  let inlineStatus = $state('');

  const imageValue = $derived(form?.image ?? post?.image ?? '');
  const categoriesValue = $derived(form?.categories ?? post?.categories?.join(', ') ?? '');
  const dateValue = $derived((form?.date ?? post?.date ?? today).slice(0, 10));
  const publishedValue = $derived(form?.published ?? post?.published ?? false);

  function onTitleInput(event: Event) {
    title = (event.currentTarget as HTMLInputElement).value;
    if (!slugTouched) slug = slugify(title);
  }

  function insertMarkdown(markdown: string) {
    const area = document.getElementById('post-body') as HTMLTextAreaElement | null;
    const start = area?.selectionStart ?? body.length;
    const end = area?.selectionEnd ?? body.length;
    body = `${body.slice(0, start)}${markdown}${body.slice(end)}`;
  }
</script>

<form
  method="POST"
  action="?/save"
  enctype="multipart/form-data"
  class="card bg-base-300 space-y-4 p-6 shadow-xl"
>
  {#if form?.error}
    <p class="text-error font-main">{form.error}</p>
  {/if}

  <label class="font-main block space-y-1">
    <span>Title</span>
    <input
      class="input input-bordered w-full"
      name="title"
      required
      value={title}
      oninput={onTitleInput}
    />
  </label>

  <label class="font-main block space-y-1">
    <span>Slug</span>
    <input
      class="input input-bordered w-full"
      name="slug"
      required
      value={slug}
      oninput={(event) => {
        slugTouched = true;
        slug = (event.currentTarget as HTMLInputElement).value;
      }}
    />
  </label>

  <label class="font-main block space-y-1">
    <span>Description</span>
    <textarea
      class="textarea textarea-bordered w-full"
      name="description"
      rows="3"
      required
      value={form?.description ?? post?.description ?? ''}
    ></textarea>
  </label>

  <label class="font-main block space-y-1">
    <span>Date</span>
    <input class="input input-bordered w-full" type="date" name="date" required value={dateValue} />
  </label>

  <label class="font-main block space-y-1">
    <span>Categories</span>
    <input
      class="input input-bordered w-full"
      name="categories"
      placeholder="theology, philosophy"
      value={categoriesValue}
    />
  </label>

  <label class="font-main block space-y-1">
    <span>Cover image URL</span>
    <input
      class="input input-bordered w-full"
      name="image"
      value={imageValue}
      placeholder="/previews/..."
    />
    {#if imageValue}
      <img class="mt-2 h-32 w-full rounded-lg object-cover" src={imageValue} alt="" />
    {/if}
  </label>

  <label class="font-main block space-y-1">
    <span>Replace cover</span>
    <input
      class="file-input file-input-bordered w-full"
      type="file"
      name="cover"
      accept="image/*"
    />
  </label>

  <label class="font-main block space-y-1">
    <span>Body</span>
    <textarea
      id="post-body"
      class="textarea textarea-bordered min-h-80 w-full font-mono"
      name="body"
      required
      bind:value={body}
    ></textarea>
  </label>

  <label class="font-main flex items-center gap-2">
    <input class="checkbox" type="checkbox" name="published" checked={publishedValue} />
    Published
  </label>

  <button class="btn btn-primary font-main" type="submit"
    >{post ? 'Update post' : 'Create post'}</button
  >
</form>

<form
  method="POST"
  action="?/inline"
  enctype="multipart/form-data"
  class="card bg-base-300 mt-6 space-y-3 p-6 shadow-xl"
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
  <h2 class="font-title text-xl">Insert an image</h2>
  <p class="font-main text-sm opacity-70">
    Uploads to Storage and places a Markdown image at the cursor in the body. Save the post
    afterward.
  </p>
  {#if inlineError}
    <p class="text-error font-main">{inlineError}</p>
  {/if}
  {#if inlineStatus}
    <p class="font-main text-sm opacity-80">{inlineStatus}</p>
  {/if}
  <input
    class="file-input file-input-bordered w-full"
    type="file"
    name="inline"
    accept="image/*"
    required
  />
  <input class="input input-bordered w-full" name="alt" placeholder="Alt text" />
  <button class="btn btn-secondary font-main" type="submit">Upload and insert</button>
</form>
