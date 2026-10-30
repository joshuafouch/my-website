<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { untrack } from 'svelte';
  import type {
    MusicAlbum,
    MusicArtist,
    MusicImage,
    MusicSong,
    PersonalContent
  } from '#lib/about.ts';
  import { openLinks } from '#lib/links.ts';
  import { renderMarkdown } from '#lib/markdown.ts';
  import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
  import MarkdownField from '#lib/components/MarkdownField.svelte';
  import MusicImagePicker from '#lib/components/MusicImagePicker.svelte';
  import PersonalAbout from '#lib/components/PersonalAbout.svelte';

  type Kind = 'artists' | 'albums' | 'songs';

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
  let images = $state<MusicImage[]>(
    untrack(() => content.library.images.map((image) => ({ ...image })))
  );
  let artists = $state<MusicArtist[]>(
    untrack(() => content.library.artists.map((artist) => ({ ...artist })))
  );
  let albums = $state<MusicAlbum[]>(
    untrack(() => content.library.albums.map((album) => ({ ...album })))
  );
  let songs = $state<MusicSong[]>(
    untrack(() => content.library.songs.map((song) => ({ ...song })))
  );
  let view = $state<'write' | 'preview'>('write');
  let introHtml = $state('');
  let leaveDialog = $state<HTMLDialogElement | null>(null);
  let leaving = $state(false);
  let pendingHref: string | null = null;
  let pendingForm: HTMLFormElement | null = null;

  let kind = $state<Kind>('artists');
  let selectedId = $state(untrack(() => artists[0]?.id ?? ''));

  let confirmOpen = $state(false);
  let confirmTitle = $state('Remove?');
  let confirmMessage = $state('');
  let confirmAction = $state<(() => void) | null>(null);

  const kinds = [
    { id: 'artists' as const, label: 'Artists' },
    { id: 'albums' as const, label: 'Albums' },
    { id: 'songs' as const, label: 'Songs' }
  ];

  const previewLibrary = $derived({ images, artists, albums, songs });
  const start = untrack(() => JSON.stringify({ intro, youtubeUrl, artists, albums, songs }));
  const dirty = $derived(JSON.stringify({ intro, youtubeUrl, artists, albums, songs }) !== start);

  const imageMap = $derived(new Map(images.map((image) => [image.id, image.url])));

  const selectedArtist = $derived(artists.find((item) => item.id === selectedId) ?? null);
  const selectedAlbum = $derived(albums.find((item) => item.id === selectedId) ?? null);
  const selectedSong = $derived(songs.find((item) => item.id === selectedId) ?? null);

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

  function move<T extends { id: string }>(list: T[], index: number, direction: -1 | 1): T[] {
    const next = index + direction;
    if (next < 0 || next >= list.length) return list;
    const copy = [...list];
    const [item] = copy.splice(index, 1);
    if (!item) return list;
    copy.splice(next, 0, item);
    return copy;
  }

  function inUse(id: string): boolean {
    return (
      artists.some((artist) => artist.imageId === id) ||
      albums.some((album) => album.imageId === id) ||
      songs.some((song) => song.imageId === id)
    );
  }

  function setKind(next: Kind) {
    kind = next;
    if (next === 'artists') selectedId = artists[0]?.id ?? '';
    else if (next === 'albums') selectedId = albums[0]?.id ?? '';
    else selectedId = songs[0]?.id ?? '';
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

  function addArtist() {
    const id = crypto.randomUUID();
    artists = [...artists, { id, name: '', note: '', url: '', imageId: '' }];
    kind = 'artists';
    selectedId = id;
  }

  function addAlbum() {
    const id = crypto.randomUUID();
    albums = [
      ...albums,
      { id, title: '', artistName: '', note: '', url: '', imageId: '' }
    ];
    kind = 'albums';
    selectedId = id;
  }

  function addSong() {
    const id = crypto.randomUUID();
    songs = [
      ...songs,
      { id, title: '', artistName: '', albumName: '', note: '', url: '', imageId: '' }
    ];
    kind = 'songs';
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
        <p class="note">Saving updates the live page. Preview shows the personal about layout.</p>

        <input type="hidden" name="artists" value={JSON.stringify(artists)} />
        <input type="hidden" name="albums" value={JSON.stringify(albums)} />
        <input type="hidden" name="songs" value={JSON.stringify(songs)} />

        <h2>Who I am</h2>
        <div class="field body-field tall">
          <label for="personal-intro">Opening paragraph</label>
          <MarkdownField id="personal-intro" name="intro" rows={8} bind:value={intro} />
          <p class="note">Markdown links work.</p>
        </div>

        <h2>Favorite music</h2>
        <p class="note">Pick a kind, then edit one entry at a time. Covers come from the shared library.</p>

        <datalist id="music-artist-names">
          {#each artists as artist (artist.id)}
            {#if artist.name.trim()}
              <option value={artist.name}></option>
            {/if}
          {/each}
        </datalist>
        <datalist id="music-album-titles">
          {#each albums as album (album.id)}
            {#if album.title.trim()}
              <option value={album.title}></option>
            {/if}
          {/each}
        </datalist>

        <div class="kind-tabs" role="tablist" aria-label="Music kind">
          {#each kinds as item (item.id)}
            <button
              type="button"
              role="tab"
              aria-selected={kind === item.id}
              onclick={() => setKind(item.id)}>{item.label}</button
            >
          {/each}
        </div>

        {#if kind === 'artists'}
          <ul class="entry-list">
            {#each artists as artist, index (artist.id)}
              <li class="entry-row" class:selected={selectedId === artist.id}>
                <button type="button" class="pick-row" onclick={() => (selectedId = artist.id)}>
                  {#if imageMap.get(artist.imageId)}
                    <img src={imageMap.get(artist.imageId)} alt="" />
                  {:else}
                    <span class="blank">No image</span>
                  {/if}
                  <span class="meta">
                    <strong>{artist.name.trim() || 'Untitled artist'}</strong>
                  </span>
                </button>
                <div class="row-actions">
                  <button type="button" onclick={() => (artists = move(artists, index, -1))}
                    >Up</button
                  >
                  <button type="button" onclick={() => (artists = move(artists, index, 1))}
                    >Down</button
                  >
                  <button
                    type="button"
                    onclick={() =>
                      askRemove('Remove artist?', 'This artist will be dropped when you save.', () => {
                        artists = artists.filter((item) => item.id !== artist.id);
                        if (selectedId === artist.id) selectedId = artists[0]?.id ?? '';
                      })}>Remove</button
                  >
                </div>
              </li>
            {/each}
          </ul>
          <div class="bar">
            <button type="button" class="solid" onclick={addArtist}>Add artist</button>
          </div>

          {#if selectedArtist}
            <div class="entry-editor">
              <label class="field">
                <span>Name</span>
                <input bind:value={selectedArtist.name} />
              </label>
              <label class="field">
                <span>Note</span>
                <textarea rows="3" bind:value={selectedArtist.note}></textarea>
              </label>
              <label class="field">
                <span>Link</span>
                <input bind:value={selectedArtist.url} placeholder="https://" />
              </label>
              <MusicImagePicker
                bind:images
                bind:imageId={selectedArtist.imageId}
                altDefault={selectedArtist.name}
                {inUse}
              />
            </div>
          {:else}
            <p class="note">Select an artist or add one.</p>
          {/if}
        {:else if kind === 'albums'}
          <ul class="entry-list">
            {#each albums as album, index (album.id)}
              <li class="entry-row" class:selected={selectedId === album.id}>
                <button type="button" class="pick-row" onclick={() => (selectedId = album.id)}>
                  {#if imageMap.get(album.imageId)}
                    <img src={imageMap.get(album.imageId)} alt="" />
                  {:else}
                    <span class="blank">No image</span>
                  {/if}
                  <span class="meta">
                    <strong>{album.title.trim() || 'Untitled album'}</strong>
                    {#if album.artistName.trim()}
                      <span>{album.artistName}</span>
                    {/if}
                  </span>
                </button>
                <div class="row-actions">
                  <button type="button" onclick={() => (albums = move(albums, index, -1))}
                    >Up</button
                  >
                  <button type="button" onclick={() => (albums = move(albums, index, 1))}
                    >Down</button
                  >
                  <button
                    type="button"
                    onclick={() =>
                      askRemove('Remove album?', 'This album will be dropped when you save.', () => {
                        albums = albums.filter((item) => item.id !== album.id);
                        if (selectedId === album.id) selectedId = albums[0]?.id ?? '';
                      })}>Remove</button
                  >
                </div>
              </li>
            {/each}
          </ul>
          <div class="bar">
            <button type="button" class="solid" onclick={addAlbum}>Add album</button>
          </div>

          {#if selectedAlbum}
            <div class="entry-editor">
              <label class="field">
                <span>Title</span>
                <input bind:value={selectedAlbum.title} />
              </label>
              <label class="field">
                <span>Artist</span>
                <input bind:value={selectedAlbum.artistName} list="music-artist-names" />
              </label>
              <label class="field">
                <span>Note</span>
                <textarea rows="3" bind:value={selectedAlbum.note}></textarea>
              </label>
              <label class="field">
                <span>Link</span>
                <input bind:value={selectedAlbum.url} placeholder="https://" />
              </label>
              <MusicImagePicker
                bind:images
                bind:imageId={selectedAlbum.imageId}
                altDefault={selectedAlbum.title}
                {inUse}
              />
            </div>
          {:else}
            <p class="note">Select an album or add one.</p>
          {/if}
        {:else}
          <ul class="entry-list">
            {#each songs as song, index (song.id)}
              <li class="entry-row" class:selected={selectedId === song.id}>
                <button type="button" class="pick-row" onclick={() => (selectedId = song.id)}>
                  {#if imageMap.get(song.imageId)}
                    <img src={imageMap.get(song.imageId)} alt="" />
                  {:else}
                    <span class="blank">No image</span>
                  {/if}
                  <span class="meta">
                    <strong>{song.title.trim() || 'Untitled song'}</strong>
                    {#if song.artistName.trim() || song.albumName.trim()}
                      <span
                        >{[song.artistName, song.albumName].filter((part) => part.trim()).join(' · ')}</span
                      >
                    {/if}
                  </span>
                </button>
                <div class="row-actions">
                  <button type="button" onclick={() => (songs = move(songs, index, -1))}>Up</button>
                  <button type="button" onclick={() => (songs = move(songs, index, 1))}>Down</button>
                  <button
                    type="button"
                    onclick={() =>
                      askRemove('Remove song?', 'This song will be dropped when you save.', () => {
                        songs = songs.filter((item) => item.id !== song.id);
                        if (selectedId === song.id) selectedId = songs[0]?.id ?? '';
                      })}>Remove</button
                  >
                </div>
              </li>
            {/each}
          </ul>
          <div class="bar">
            <button type="button" class="solid" onclick={addSong}>Add song</button>
          </div>

          {#if selectedSong}
            <div class="entry-editor">
              <label class="field">
                <span>Title</span>
                <input bind:value={selectedSong.title} />
              </label>
              <label class="field">
                <span>Artist</span>
                <input bind:value={selectedSong.artistName} list="music-artist-names" />
              </label>
              <label class="field">
                <span>Album</span>
                <input bind:value={selectedSong.albumName} list="music-album-titles" />
              </label>
              <label class="field">
                <span>Note</span>
                <textarea rows="3" bind:value={selectedSong.note}></textarea>
              </label>
              <label class="field">
                <span>Link</span>
                <input bind:value={selectedSong.url} placeholder="https://" />
              </label>
              <MusicImagePicker
                bind:images
                bind:imageId={selectedSong.imageId}
                altDefault={selectedSong.title}
                {inUse}
              />
            </div>
          {:else}
            <p class="note">Select a song or add one.</p>
          {/if}
        {/if}

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

        <div class="bar">
          <button class="solid" type="submit">Save</button>
        </div>
      </form>
    </div>

    <aside class="split-preview" aria-label="Live preview">
      <div class="preview-copy font-serif">
        <PersonalAbout {introHtml} {youtubeUrl} library={previewLibrary} />
      </div>
    </aside>
  </div>

  <ConfirmDialog
    bind:open={confirmOpen}
    title={confirmTitle}
    message={confirmMessage}
    onconfirm={runConfirm}
  />

  <dialog class="leave" bind:this={leaveDialog} aria-labelledby="leave-title" onclose={stay}>
    <h2 id="leave-title">Leave without saving?</h2>
    <p>Personal about changes have not been saved.</p>
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
  h2 {
    margin: 2rem 0 0;
    font-size: 1.8rem;
    font-weight: 500;
  }

  h2:first-of-type {
    margin-top: 0.5rem;
  }

  .kind-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    margin-top: 1rem;
    font-size: 1.15rem;
    font-variant: small-caps;
    letter-spacing: 0.12em;
  }

  .kind-tabs button {
    padding: 0 0 0.15rem;
    border: 0;
    border-bottom: 1px solid transparent;
    background: none;
    color: var(--ink-muted);
    font: inherit;
    cursor: pointer;
  }

  .kind-tabs button[aria-selected='true'] {
    border-bottom-color: var(--ink-accent);
    color: var(--ink);
  }

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
    display: grid;
    grid-template-columns: 3.2rem minmax(0, 1fr);
    gap: 0.75rem;
    align-items: center;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .pick-row img,
  .blank {
    width: 3.2rem;
    height: 3.2rem;
    object-fit: cover;
    border: 1px solid color-mix(in oklab, var(--ink) 42%, transparent);
    background: color-mix(in oklab, var(--ground) 68%, var(--ink));
  }

  .blank {
    display: grid;
    place-items: center;
    color: var(--ink-muted);
    font-size: 0.7rem;
    text-align: center;
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
