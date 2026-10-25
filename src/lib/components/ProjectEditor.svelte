<script lang="ts">
  import { untrack } from 'svelte';
  import ProjectPreview from '#lib/components/ProjectPreview.svelte';
  import { slugify } from '#lib/slug.ts';

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

  let { project = null, form = null }: { project?: ProjectFields | null; form?: Fields | null } =
    $props();

  const today = new Date().toISOString().slice(0, 10);
  let title = $state(untrack(() => form?.title ?? project?.title ?? ''));
  let slug = $state(untrack(() => form?.slug ?? project?.slug ?? ''));
  let slugTouched = $state(untrack(() => Boolean(project?.slug || form?.slug)));
  let description = $state(untrack(() => form?.description ?? project?.description ?? ''));
  let details = $state(untrack(() => form?.details ?? project?.details ?? ''));
  let date = $state(untrack(() => (form?.date ?? project?.date ?? today).slice(0, 10)));
  let image = $state(untrack(() => form?.image ?? project?.image ?? ''));
  let images = $state(untrack(() => form?.images ?? project?.images?.join('\n') ?? ''));
  let tags = $state(untrack(() => form?.tags ?? project?.tags?.join(', ') ?? ''));
  let sourceUrl = $state(untrack(() => form?.sourceUrl ?? project?.source_url ?? ''));
  let published = $state(untrack(() => form?.published ?? project?.published ?? false));
  let view = $state<'write' | 'preview'>('write');

  const extraImages = $derived(
    images
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  );
  const previewTags = $derived(
    tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  );

  function onTitleInput(event: Event) {
    title = (event.currentTarget as HTMLInputElement).value;
    if (!slugTouched) slug = slugify(title);
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
    <form method="POST" action="?/save">
      {#if project}
        <input type="hidden" name="id" value={project.id} />
      {/if}

      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}
      <p class="note">
        The preview matches the opened card on the projects page. It stays private until you publish
        and save.
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

      <label class="field">
        <span>Details</span>
        <textarea name="details" rows="8" bind:value={details}></textarea>
      </label>
      <p class="note">The longer writeup in the opened card. Line breaks are kept.</p>

      <label class="field">
        <span>Date</span>
        <input type="date" name="date" required bind:value={date} />
      </label>

      <label class="field">
        <span>Cover image URL</span>
        <input name="image" bind:value={image} placeholder="/assets/hero-bg.webp" />
      </label>

      <label class="field">
        <span>Extra image URLs</span>
        <textarea name="images" rows="4" placeholder="/assets/one.webp" bind:value={images}
        ></textarea>
      </label>
      <p class="note">One path or URL per line. They show at the end of the opened card.</p>

      <label class="field">
        <span>Tags</span>
        <input name="tags" placeholder="sveltekit, tailwindcss" bind:value={tags} />
      </label>

      <label class="field">
        <span>Source URL</span>
        <input name="sourceUrl" bind:value={sourceUrl} placeholder="https://github.com/..." />
      </label>

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
      {details}
      {image}
      images={extraImages}
      tags={previewTags}
      {sourceUrl}
    />
  </aside>
</div>
