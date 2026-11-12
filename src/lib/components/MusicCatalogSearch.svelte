<script lang="ts">
  import { deserialize } from '$app/forms';
  import type { MusicCatalogHit, MusicCatalogKind } from '#lib/music-catalog-types.ts';

  let {
    kind,
    seed = '',
    onpick
  }: {
    kind: MusicCatalogKind;
    seed?: string;
    onpick: (hit: MusicCatalogHit) => void;
  } = $props();

  let query = $state('');
  let results = $state<MusicCatalogHit[]>([]);
  let error = $state('');
  let status = $state('');
  let busy = $state(false);
  let open = $state(false);

  $effect(() => {
    if (!open && seed.trim() && !query.trim()) query = seed.trim();
  });

  function actionError(
    result: ReturnType<typeof deserialize>,
    fallback: string,
    statusCode: number
  ): string {
    if (result.type === 'failure' && result.data && typeof result.data.error === 'string') {
      return result.data.error;
    }
    if (statusCode >= 500) return 'Server error. Try again.';
    if (statusCode === 401) return 'Sign in again to search Discogs.';
    return fallback;
  }

  async function search() {
    const q = query.trim();
    if (!q) {
      error = 'Type a name to search.';
      return;
    }
    error = '';
    status = 'Searching…';
    busy = true;
    results = [];
    open = true;
    try {
      const body = new FormData();
      body.set('kind', kind);
      body.set('query', q);
      const response = await fetch('?/searchCatalog', {
        method: 'POST',
        body,
        headers: {
          accept: 'application/json',
          'x-sveltekit-action': 'true'
        }
      });
      const text = await response.text();
      let result: ReturnType<typeof deserialize>;
      try {
        result = deserialize(text);
      } catch {
        error = actionError(
          { type: 'error', status: response.status, error: new Error('bad response') } as never,
          'Could not search Discogs.',
          response.status
        );
        return;
      }
      if (result.type === 'success' && result.data && Array.isArray(result.data.results)) {
        results = result.data.results as MusicCatalogHit[];
        if (results.length === 0) error = 'No matches.';
        return;
      }
      error = actionError(result, 'Could not search Discogs.', response.status);
    } catch {
      error = 'Could not search Discogs.';
    } finally {
      busy = false;
      status = '';
    }
  }

  function pick(hit: MusicCatalogHit) {
    onpick(hit);
    open = false;
    results = [];
  }
</script>

<div class="catalog">
  <div class="row">
    <label class="field grow">
      <span>Search Discogs</span>
      <input
        bind:value={query}
        placeholder={kind === 'artist'
          ? 'Artist name'
          : kind === 'album'
            ? 'Album title'
            : 'Song title'}
        onkeydown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            void search();
          }
        }}
      />
    </label>
    <button type="button" class="solid" disabled={busy} onclick={() => void search()}>
      {busy ? 'Searching…' : 'Search'}
    </button>
  </div>
  {#if status}
    <p class="note">{status}</p>
  {/if}
  {#if error}
    <p class="error">{error}</p>
  {/if}
  {#if open && results.length > 0}
    <ul class="hits">
      {#each results as hit (hit.id)}
        <li>
          <button type="button" class="hit" onclick={() => pick(hit)}>
            {#if hit.imageUrl}
              <img src={hit.imageUrl} alt="" />
            {:else}
              <span class="blank">No art</span>
            {/if}
            <span class="meta">
              <strong>{hit.name}</strong>
              {#if hit.artistName || hit.albumName}
                <span>{[hit.artistName, hit.albumName].filter(Boolean).join(' · ')}</span>
              {/if}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .catalog {
    display: grid;
    gap: 0.55rem;
    margin: 0 0 0.85rem;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.65rem;
    align-items: end;
  }

  .grow {
    min-width: 0;
  }

  .hits {
    display: grid;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .hit {
    display: grid;
    grid-template-columns: 2.8rem minmax(0, 1fr);
    gap: 0.65rem;
    align-items: center;
    width: 100%;
    padding: 0.4rem;
    border: 1px solid color-mix(in oklab, var(--ink) 28%, transparent);
    background: color-mix(in oklab, var(--ground) 88%, var(--ink));
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .hit:hover,
  .hit:focus-visible {
    border-color: var(--ink-accent);
  }

  .hit img,
  .blank {
    width: 2.8rem;
    height: 2.8rem;
    object-fit: cover;
    border: 1px solid color-mix(in oklab, var(--ink) 42%, transparent);
    background: color-mix(in oklab, var(--ground) 68%, var(--ink));
  }

  .blank {
    display: grid;
    place-items: center;
    color: var(--ink-muted);
    font-size: 0.65rem;
    text-align: center;
  }

  .meta {
    display: grid;
    gap: 0.1rem;
    min-width: 0;
  }

  .meta strong {
    font-weight: 500;
  }

  .meta span {
    color: var(--ink-muted);
    font-size: 0.92rem;
  }

  .error {
    margin: 0;
    color: var(--ink-accent);
  }
</style>
