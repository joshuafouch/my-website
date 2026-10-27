<script lang="ts">
  import { marked } from 'marked';
  import { untrack } from 'svelte';
  import type {
    MusicAlbum,
    MusicArtist,
    MusicImage,
    MusicSong,
    PersonalContent
  } from '#lib/about.ts';
  import { openLinks } from '#lib/links.ts';
  import MusicImagePicker from '#lib/components/MusicImagePicker.svelte';
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
  let dialog = $state<HTMLDialogElement>();
  let introHtml = $state('');

  const previewLibrary = $derived({ images, artists, albums, songs });

  function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
    const next = index + direction;
    if (next < 0 || next >= list.length) return list;
    const copy = [...list];
    const [item] = copy.splice(index, 1);
    if (!item) return list;
    copy.splice(next, 0, item);
    return copy;
  }

  function removeArtist(id: string) {
    artists = artists.filter((artist) => artist.id !== id);
  }

  function removeAlbum(id: string) {
    albums = albums.filter((album) => album.id !== id);
  }

  function inUse(id: string): boolean {
    return (
      artists.some((artist) => artist.imageId === id) ||
      albums.some((album) => album.imageId === id) ||
      songs.some((song) => song.imageId === id)
    );
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

  <input type="hidden" name="artists" value={JSON.stringify(artists)} />
  <input type="hidden" name="albums" value={JSON.stringify(albums)} />
  <input type="hidden" name="songs" value={JSON.stringify(songs)} />

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
    <p class="note">
      Artists, albums, and songs each stand on their own. The artist and album lines are optional,
      and you can type any name.
    </p>
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

    <h3>Artists</h3>
    {#each artists as artist, index (artist.id)}
      <div class="block">
        <label class="field">
          <span>Name</span>
          <input bind:value={artist.name} />
        </label>
        <label class="field">
          <span>Note</span>
          <textarea rows="3" bind:value={artist.note}></textarea>
        </label>
        <label class="field">
          <span>Link</span>
          <input bind:value={artist.url} placeholder="https://" />
        </label>
        <MusicImagePicker
          bind:images
          bind:imageId={artist.imageId}
          altDefault={artist.name}
          {inUse}
        />
        <div class="row-actions">
          <button type="button" onclick={() => (artists = move(artists, index, -1))}>Up</button>
          <button type="button" onclick={() => (artists = move(artists, index, 1))}>Down</button>
          <button type="button" onclick={() => removeArtist(artist.id)}>Remove</button>
        </div>
      </div>
    {/each}
    <div class="bar">
      <button
        type="button"
        class="solid"
        onclick={() =>
          (artists = [
            ...artists,
            { id: crypto.randomUUID(), name: '', note: '', url: '', imageId: '' }
          ])}>Add artist</button
      >
    </div>

    <h3>Albums</h3>
    {#each albums as album, index (album.id)}
      <div class="block">
        <label class="field">
          <span>Title</span>
          <input bind:value={album.title} />
        </label>
        <label class="field">
          <span>Artist</span>
          <input bind:value={album.artistName} list="music-artist-names" />
        </label>
        <label class="field">
          <span>Note</span>
          <textarea rows="3" bind:value={album.note}></textarea>
        </label>
        <label class="field">
          <span>Link</span>
          <input bind:value={album.url} placeholder="https://" />
        </label>
        <MusicImagePicker
          bind:images
          bind:imageId={album.imageId}
          altDefault={album.title}
          {inUse}
        />
        <div class="row-actions">
          <button type="button" onclick={() => (albums = move(albums, index, -1))}>Up</button>
          <button type="button" onclick={() => (albums = move(albums, index, 1))}>Down</button>
          <button type="button" onclick={() => removeAlbum(album.id)}>Remove</button>
        </div>
      </div>
    {/each}
    <div class="bar">
      <button
        type="button"
        class="solid"
        onclick={() =>
          (albums = [
            ...albums,
            { id: crypto.randomUUID(), title: '', artistName: '', note: '', url: '', imageId: '' }
          ])}>Add album</button
      >
    </div>

    <h3>Songs</h3>
    {#each songs as song, index (song.id)}
      <div class="block">
        <label class="field">
          <span>Title</span>
          <input bind:value={song.title} />
        </label>
        <label class="field">
          <span>Artist</span>
          <input bind:value={song.artistName} list="music-artist-names" />
        </label>
        <label class="field">
          <span>Album</span>
          <input bind:value={song.albumName} list="music-album-titles" />
        </label>
        <label class="field">
          <span>Note</span>
          <textarea rows="3" bind:value={song.note}></textarea>
        </label>
        <label class="field">
          <span>Link</span>
          <input bind:value={song.url} placeholder="https://" />
        </label>
        <MusicImagePicker bind:images bind:imageId={song.imageId} altDefault={song.title} {inUse} />
        <div class="row-actions">
          <button type="button" onclick={() => (songs = move(songs, index, -1))}>Up</button>
          <button type="button" onclick={() => (songs = move(songs, index, 1))}>Down</button>
          <button
            type="button"
            onclick={() => (songs = songs.filter((item) => item.id !== song.id))}>Remove</button
          >
        </div>
      </div>
    {/each}
    <div class="bar">
      <button
        type="button"
        class="solid"
        onclick={() =>
          (songs = [
            ...songs,
            {
              id: crypto.randomUUID(),
              title: '',
              artistName: '',
              albumName: '',
              note: '',
              url: '',
              imageId: ''
            }
          ])}>Add song</button
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
    <PersonalAbout {introHtml} {youtubeUrl} library={previewLibrary} />
  </div>
</dialog>
