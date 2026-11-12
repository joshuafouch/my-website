<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { musicCoverUrl, type MusicLibrary } from '#lib/about.ts';
  import { safeHref } from '#lib/links.ts';

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

  /** Only keep a tight window of 3D layers alive. */
  const WINDOW = 2;

  let kind = $state<Kind>('artists');
  let places = $state({ artists: 0, albums: 0, songs: 0 });
  let stage = $state<HTMLElement>();
  let dragged = $state(false);
  let animating = $state(false);
  let settleTimer = 0;
  /** Firefox needs a DOM mirror; set after mount to avoid SSR hydration mismatch. */
  let useDomMirror = $state(false);

  onMount(() => {
    useDomMirror = !(
      CSS.supports('-webkit-box-reflect', 'below 0') ||
      CSS.supports('-webkit-box-reflect', 'below 0px')
    );
  });

  function markAnimating() {
    animating = true;
    if (settleTimer) clearTimeout(settleTimer);
    // Fallback if transitionend is skipped (reduced motion / tab switch).
    settleTimer = window.setTimeout(() => {
      animating = false;
      settleTimer = 0;
    }, 320);
  }

  const items = $derived(coversFor(library, kind));
  const active = $derived(items.length === 0 ? 0 : Math.min(places[kind], items.length - 1));
  const current = $derived(items[active]);
  const meta = $derived(
    current ? [current.detail, `${active + 1} of ${items.length}`].filter(Boolean).join(' · ') : ''
  );
  const visible = $derived(
    items
      .map((item, index) => ({ item, index, delta: index - active }))
      .filter((entry) => Math.abs(entry.delta) <= WINDOW)
  );

  // Warm nearby covers so the next step never waits on decode.
  $effect(() => {
    for (const entry of visible) {
      if (!entry.item.imageUrl) continue;
      const img = new Image();
      img.decoding = 'async';
      img.src = entry.item.imageUrl;
    }
  });

  function coversFor(source: MusicLibrary, selected: Kind): Cover[] {
    const images = new Map(source.images.map((image) => [image.id, image.url]));

    if (selected === 'artists') {
      return source.artists.map((artist) => ({
        id: artist.id,
        title: artist.name,
        detail: '',
        imageUrl: musicCoverUrl(artist.imageUrl, artist.imageId, images),
        href: safeHref(artist.url)
      }));
    }

    if (selected === 'albums') {
      return source.albums.map((album) => ({
        id: album.id,
        title: album.title,
        detail: album.artistName,
        imageUrl: musicCoverUrl(album.imageUrl, album.imageId, images),
        href: safeHref(album.url)
      }));
    }

    return source.songs.map((song) => ({
      id: song.id,
      title: song.title,
      detail: [song.artistName, song.albumName].filter(Boolean).join(' · '),
      imageUrl: musicCoverUrl(song.imageUrl, song.imageId, images),
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
    if (next < 0 || next >= items.length) return false;
    places[kind] = next;
    markAnimating();
    return true;
  }

  function onCoverTransitionEnd(event: TransitionEvent) {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== 'transform') return;
    animating = false;
    if (settleTimer) {
      clearTimeout(settleTimer);
      settleTimer = 0;
    }
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
      markAnimating();
      await focusCurrent();
    } else if (event.key === 'End') {
      event.preventDefault();
      places[kind] = Math.max(items.length - 1, 0);
      markAnimating();
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
      markAnimating();
      return;
    }
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  }

  function horizontalWheel(node: HTMLElement) {
    let pending = 0;
    let frame = 0;
    const STEP = 48;

    const flush = () => {
      frame = 0;
      // One step per frame, but keep draining so a trackpad flick can travel like key-repeat.
      if (pending > STEP) {
        if (!step(1)) {
          pending = 0;
          return;
        }
        pending -= STEP;
      } else if (pending < -STEP) {
        if (!step(-1)) {
          pending = 0;
          return;
        }
        pending += STEP;
      } else {
        return;
      }
      if (Math.abs(pending) > STEP) frame = requestAnimationFrame(flush);
    };

    const onWheel = (event: WheelEvent) => {
      if (items.length < 2) return;
      // Trackpads send deltaX (side swipe) or deltaY (two-finger scroll); both drive the carousel.
      const dominant =
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (dominant === 0) return;
      event.preventDefault();
      pending += dominant;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return {
      destroy() {
        node.removeEventListener('wheel', onWheel);
        if (frame) cancelAnimationFrame(frame);
      }
    };
  }

  function drag(node: HTMLElement) {
    let startX = 0;
    let lastX = 0;
    let tracking = false;
    let frame = 0;
    let queued: -1 | 0 | 1 = 0;

    const flush = () => {
      frame = 0;
      if (!queued || animating) {
        queued = 0;
        return;
      }
      step(queued);
      queued = 0;
    };

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
      if (Math.abs(dx) < 36 || animating) return;
      queued = dx < 0 ? 1 : -1;
      lastX = event.clientX;
      if (!frame) frame = requestAnimationFrame(flush);
    }

    function onUp() {
      tracking = false;
      queued = 0;
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
        if (frame) cancelAnimationFrame(frame);
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
        {#each visible as entry (entry.item.id)}
          <button
            type="button"
            class="cover"
            class:is-active={entry.delta === 0}
            style={place(entry.delta)}
            aria-current={entry.delta === 0 ? 'true' : undefined}
            aria-label={entry.item.detail
              ? `${entry.item.title}, ${entry.item.detail}`
              : entry.item.title}
            tabindex={entry.delta === 0 ? 0 : -1}
            onkeydown={onKey}
            onclick={() => choose(entry.index, entry.item.href)}
            ontransitionend={onCoverTransitionEnd}
          >
            <span class="face">
              <span class="face-clip">
                {#if entry.item.imageUrl}
                  <img
                    class="art"
                    src={entry.item.imageUrl}
                    alt=""
                    width="424"
                    height="424"
                    decoding="async"
                    draggable="false"
                  />
                {:else}
                  <span class="face-title">{entry.item.title}</span>
                {/if}
              </span>
            </span>
            {#if useDomMirror && entry.item.imageUrl}
              <span class="reflect" aria-hidden="true">
                <img
                  class="reflect-art"
                  src={entry.item.imageUrl}
                  alt=""
                  width="424"
                  height="424"
                  decoding="async"
                  draggable="false"
                />
              </span>
            {/if}
          </button>
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
    contain: layout paint;
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
    transform: translate3d(calc(var(--x) * var(--face)), 0, var(--z)) rotateY(var(--rot));
    opacity: var(--fade, 1);
    transform-style: preserve-3d;
    will-change: transform, opacity;
    /* Avoid contain:paint — it clips -webkit-box-reflect. */
    contain: layout;
    transition:
      transform 280ms cubic-bezier(0.22, 0.8, 0.2, 1),
      opacity 280ms ease;
  }

  .face {
    display: block;
    aspect-ratio: 1;
    background-color: var(--surface-raised);
    border: 1px solid color-mix(in oklab, var(--nord4) 24%, transparent);
    box-shadow: 0 12px 28px color-mix(in oklab, black 32%, transparent);
    backface-visibility: hidden;
    /* Native Cover Flow mirror (Chromium / WebKit / Edge). */
    -webkit-box-reflect: below 0 linear-gradient(to bottom, transparent 35%, rgb(0 0 0 / 0.55) 100%);
  }

  .face-clip {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    overflow: hidden;
  }

  .cover.is-active .face {
    box-shadow: 0 16px 34px color-mix(in oklab, black 38%, transparent);
  }

  .art,
  .reflect-art {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
  }

  .face-title {
    padding: 0.75rem;
    color: var(--ink);
    font-size: 1.15rem;
    line-height: 1.25;
    text-align: center;
    text-wrap: balance;
  }

  /* Firefox: DOM mirror reuses the same cached image src. */
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

  .reflect-art {
    height: var(--face);
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
      will-change: auto;
    }
  }

  :global(html[data-motion='off']) .cover {
    transition: none;
    will-change: auto;
  }
</style>
