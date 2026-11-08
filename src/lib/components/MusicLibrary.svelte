<script lang="ts">
  import { tick } from 'svelte';
  import { safeHref } from '#lib/links.ts';
  import type { MusicLibrary } from '#lib/about.ts';

  let { library }: { library: MusicLibrary } = $props();

  type Kind = 'artists' | 'albums' | 'songs';
  type Cover = {
    id: string;
    title: string;
    detail: string;
    imageUrl: string;
    href: string | null;
  };

  const kinds = [
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
    { id: 'songs', label: 'Songs' }
  ] as const;

  let kind = $state<Kind>('artists');
  let places = $state({ artists: 0, albums: 0, songs: 0 });
  let stage = $state<HTMLElement>();
  let dragged = $state(false);

  const items = $derived(coversFor(library, kind));
  const active = $derived(items.length === 0 ? 0 : Math.min(places[kind], items.length - 1));
  const current = $derived(items[active]);
  const meta = $derived(
    current ? [current.detail, `${active + 1} of ${items.length}`].filter(Boolean).join(' · ') : ''
  );

  function coversFor(source: MusicLibrary, selected: Kind): Cover[] {
    const images = new Map(source.images.map((image) => [image.id, image.url]));

    if (selected === 'artists') {
      return source.artists.map((artist) => ({
        id: artist.id,
        title: artist.name,
        detail: '',
        imageUrl: images.get(artist.imageId) ?? '',
        href: safeHref(artist.url)
      }));
    }

    if (selected === 'albums') {
      return source.albums.map((album) => ({
        id: album.id,
        title: album.title,
        detail: album.artistName,
        imageUrl: images.get(album.imageId) ?? '',
        href: safeHref(album.url)
      }));
    }

    return source.songs.map((song) => ({
      id: song.id,
      title: song.title,
      detail: [song.artistName, song.albumName].filter(Boolean).join(' · '),
      imageUrl: images.get(song.imageId) ?? '',
      href: safeHref(song.url)
    }));
  }

  function place(delta: number): string {
    const distance = Math.abs(delta);
    const direction = Math.sign(delta) || 1;
    const x = distance === 0 ? 0 : direction * (0.78 + (distance - 1) * 0.34);
    const z = distance === 0 ? 70 : -36 - (distance - 1) * 8;
    const rot = distance === 0 ? 0 : direction * -56;
    const fade = distance === 0 ? 1 : Math.max(0.42, 0.78 - (distance - 1) * 0.12);
    return `--x:${x};--z:${z}px;--rot:${rot}deg;--fade:${fade};z-index:${40 - distance};`;
  }

  async function focusCurrent() {
    await tick();
    stage
      ?.querySelector<HTMLButtonElement>('[aria-current="true"]')
      ?.focus({ preventScroll: true });
  }

  function step(direction: -1 | 1) {
    const next = active + direction;
    if (next < 0 || next >= items.length) return;
    places[kind] = next;
  }

  async function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      step(1);
      await focusCurrent();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      step(-1);
      await focusCurrent();
    } else if (event.key === 'Home') {
      event.preventDefault();
      places[kind] = 0;
      await focusCurrent();
    } else if (event.key === 'End') {
      event.preventDefault();
      places[kind] = Math.max(items.length - 1, 0);
      await focusCurrent();
    }
  }

  function choose(index: number, href: string | null) {
    if (dragged) {
      dragged = false;
      return;
    }
    if (index !== active) {
      places[kind] = index;
      return;
    }
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  }

  function horizontalWheel(node: HTMLElement) {
    let pending = 0;
    const onWheel = (event: WheelEvent) => {
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontal || items.length < 2) return;
      event.preventDefault();
      pending +=
        event.shiftKey && Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;
      while (pending > 48) {
        step(1);
        pending -= 48;
      }
      while (pending < -48) {
        step(-1);
        pending += 48;
      }
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return {
      destroy() {
        node.removeEventListener('wheel', onWheel);
      }
    };
  }

  function drag(node: HTMLElement) {
    let startX = 0;
    let lastX = 0;
    let tracking = false;

    function onDown(event: PointerEvent) {
      if (event.button !== 0) return;
      tracking = true;
      dragged = false;
      startX = event.clientX;
      lastX = event.clientX;
      node.setPointerCapture(event.pointerId);
    }

    function onMove(event: PointerEvent) {
      if (!tracking) return;
      const dx = event.clientX - lastX;
      if (Math.abs(event.clientX - startX) > 8) dragged = true;
      if (Math.abs(dx) < 36) return;
      step(dx < 0 ? 1 : -1);
      lastX = event.clientX;
    }

    function onUp() {
      tracking = false;
    }

    node.addEventListener('pointerdown', onDown);
    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerup', onUp);
    node.addEventListener('pointercancel', onUp);
    return {
      destroy() {
        node.removeEventListener('pointerdown', onDown);
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerup', onUp);
        node.removeEventListener('pointercancel', onUp);
      }
    };
  }
</script>

<div class="library">
  <div class="switch" role="tablist" aria-label="Favorite music">
    {#each kinds as item (item.id)}
      <button
        type="button"
        role="tab"
        aria-selected={kind === item.id}
        aria-controls="music-panel"
        onclick={() => (kind = item.id)}
      >
        {item.label}
      </button>
    {/each}
  </div>

  <div id="music-panel" role="tabpanel" tabindex="-1">
    {#if items.length === 0}
      <p class="empty">Nothing here yet.</p>
    {:else}
      <div
        class="stage"
        bind:this={stage}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${kinds.find((item) => item.id === kind)?.label}, use arrow keys or scroll horizontally to browse`}
        use:horizontalWheel
        use:drag
      >
        {#each items as item, index (item.id)}
          {@const delta = index - active}
          {#if Math.abs(delta) <= 6}
            <button
              type="button"
              class="cover"
              style={place(delta)}
              aria-current={delta === 0 ? 'true' : undefined}
              aria-label={item.detail ? `${item.title}, ${item.detail}` : item.title}
              tabindex={delta === 0 ? 0 : -1}
              onkeydown={onKey}
              onclick={() => choose(index, item.href)}
            >
              <span
                class="face"
                style:background-image={item.imageUrl && Math.abs(delta) <= 3
                  ? `url("${item.imageUrl}")`
                  : undefined}
              >
                {#if !item.imageUrl}
                  <span class="face-title">{item.title}</span>
                {/if}
              </span>
              {#if item.imageUrl && Math.abs(delta) <= 3}
                <span class="reflect" aria-hidden="true">
                  <span class="reflect-face" style:background-image={`url("${item.imageUrl}")`}
                  ></span>
                </span>
              {/if}
            </button>
          {/if}
        {/each}
      </div>
      <p class="caption" aria-live="polite">
        <span class="caption-title">{current.title}</span>
        <span class="caption-meta">{meta}</span>
      </p>
    {/if}
  </div>
</div>

<style>
  .library {
    container-type: inline-size;
  }

  .switch {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 1.5rem;
    margin: 1.15rem 0 0;
  }

  .switch button {
    border: 0;
    border-bottom: 1px solid transparent;
    background: none;
    color: var(--ink-muted);
    font: inherit;
    font-variant: small-caps;
    letter-spacing: 0.14em;
    font-size: 1.28rem;
    cursor: pointer;
    padding: 0 0 0.08rem;
  }

  .switch button[aria-selected='true'] {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }

  .switch button:focus-visible {
    color: var(--ink-accent);
    outline: none;
  }

  .empty {
    margin: 1.25rem 0 0;
    color: var(--ink-muted);
    font-size: 1.25rem;
  }

  .stage {
    --face: clamp(8.25rem, 46cqi, 13.25rem);
    position: relative;
    height: calc(var(--face) * 1.46 + 0.55rem);
    margin-top: 1.35rem;
    overflow: hidden;
    perspective: 1100px;
    touch-action: pan-y;
    user-select: none;
  }

  .stage:focus-visible {
    outline: none;
  }

  .cover {
    position: absolute;
    top: 0.2rem;
    left: 50%;
    width: var(--face);
    margin-left: calc(var(--face) / -2);
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    transform: translateX(calc(var(--x) * var(--face))) translateZ(var(--z)) rotateY(var(--rot));
    opacity: var(--fade, 1);
    transform-style: preserve-3d;
    transition:
      transform 460ms cubic-bezier(0.22, 0.7, 0.2, 1),
      opacity 460ms ease;
  }

  .face {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    overflow: hidden;
    background-color: var(--surface-raised);
    background-position: center;
    background-size: cover;
    border: 1px solid color-mix(in oklab, var(--nord4) 24%, transparent);
    box-shadow: 0 12px 28px color-mix(in oklab, black 32%, transparent);
  }

  .face-title {
    padding: 0.75rem;
    color: var(--ink);
    font-size: 1.15rem;
    line-height: 1.25;
    text-align: center;
    text-wrap: balance;
  }

  .reflect {
    position: absolute;
    right: 0;
    left: 0;
    top: 100%;
    height: 42%;
    overflow: hidden;
    pointer-events: none;
    opacity: 0.55;
    mask-image: linear-gradient(to bottom, rgb(0 0 0 / 0.72), transparent 82%);
  }

  .reflect-face {
    display: block;
    height: var(--face);
    background-position: center;
    background-size: cover;
    transform: scaleY(-1);
  }

  .caption {
    margin: 0.35rem 0 0;
    text-align: center;
  }

  .caption-title {
    display: block;
    color: var(--ink);
    font-size: 1.55rem;
  }

  .caption-meta {
    display: block;
    margin-top: 0.15rem;
    color: var(--ink-muted);
    font-variant: small-caps;
    letter-spacing: 0.12em;
    font-size: 1.05rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .cover {
      transition: none;
    }
  }

  :global(html[data-motion='off']) .cover {
    transition: none;
  }
</style>
