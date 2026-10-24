<script lang="ts">
  import { marked } from 'marked';
  import { untrack } from 'svelte';
  import type { MusicEntry, PersonalContent } from '#lib/about.ts';
  import { openLinks } from '#lib/links.ts';
  import PersonalAbout from '#lib/components/PersonalAbout.svelte';

  let {
    content,
    error = '',
    saved = false
  }: {
    content: PersonalContent;
    error?: string;
    saved?: boolean;
  } = $props();

  let intro = $state(untrack(() => content.intro));
  let youtubeUrl = $state(untrack(() => content.youtubeUrl));
  let music = $state<MusicEntry[]>(untrack(() => content.music.map((entry) => ({ ...entry }))));
  let dialog = $state<HTMLDialogElement>();
  let introHtml = $state('');

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
    if (dialog && !dialog.open) dialog.showModal();
  }

  function closePreview() {
    dialog?.close();
  }
</script>

<form method="POST">
  {#if error}
    <p class="error">{error}</p>
  {/if}
  {#if saved}
    <p class="ok">Saved. The about page is updated.</p>
  {/if}
  <p class="note">Saving updates the live page. Preview checks the look before you save.</p>

  <input type="hidden" name="music" value={JSON.stringify(music)} />

  <section class="editor">
    <h2>Who I am</h2>
    <label class="field">
      <span>Opening paragraph</span>
      <textarea name="intro" rows="6" bind:value={intro}></textarea>
    </label>
    <p class="note">This sits at the top of the personal page. Markdown links work.</p>
  </section>

  <section class="editor">
    <h2>Favorite music</h2>
    {#each music as entry, index (entry.id)}
      <div class="block">
        <label class="field">
          <span>Title</span>
          <input bind:value={entry.title} />
        </label>
        <label class="field">
          <span>Artist</span>
          <input bind:value={entry.artist} />
        </label>
        <label class="field">
          <span>Note</span>
          <textarea rows="3" bind:value={entry.note}></textarea>
        </label>
        <label class="field">
          <span>Link</span>
          <input bind:value={entry.url} placeholder="https://" />
        </label>
        <div class="row-actions">
          <button type="button" onclick={() => (music = move(music, index, -1))}>Up</button>
          <button type="button" onclick={() => (music = move(music, index, 1))}>Down</button>
          <button
            type="button"
            onclick={() => (music = music.filter((item) => item.id !== entry.id))}>Remove</button
          >
        </div>
      </div>
    {/each}
    <div class="bar">
      <button
        type="button"
        class="solid"
        onclick={() =>
          (music = [
            ...music,
            { id: crypto.randomUUID(), title: '', artist: '', note: '', url: '' }
          ])}>Add music</button
      >
    </div>
  </section>

  <section class="editor">
    <h2>Latest video</h2>
    <label class="field">
      <span>YouTube link, or any other link</span>
      <input
        name="youtubeUrl"
        bind:value={youtubeUrl}
        placeholder="https://www.youtube.com/watch?v="
      />
    </label>
    <p class="note">A YouTube link is embedded. Any other link shows as a watch link.</p>
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
>
  <div class="preview-bar">
    <button class="preview-close" type="button" onclick={closePreview}>Close</button>
  </div>
  <div class="preview-copy font-serif">
    <PersonalAbout {introHtml} {youtubeUrl} {music} />
  </div>
</dialog>
