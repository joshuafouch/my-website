const STORAGE_KEY = 'site-backdrop';

export const photos = [
  '/assets/backgrounds/hero-bg.webp',
  '/assets/backgrounds/valleybutte.webp',
  '/assets/backgrounds/FullSizeRender.webp',
  '/assets/backgrounds/IMG_0079.webp',
  '/assets/backgrounds/IMG_1328.webp',
  '/assets/backgrounds/IMG_1483.webp',
  '/assets/backgrounds/IMG_1797.webp',
  '/assets/backgrounds/IMG_3188.webp',
  '/assets/backgrounds/IMG_3208.webp',
  '/assets/backgrounds/IMG_6678.webp',
  '/assets/backgrounds/IMG_6706.webp',
  '/assets/backgrounds/IMG_6749.webp',
  '/assets/backgrounds/IMG_6791.webp',
  '/assets/backgrounds/IMG_9540.webp'
] as const;

export const backdrop = $state({
  index: 0,
  previous: 0,
  revealed: false,
  /** The saved choice has been read on the client (see restoreBackdrop). */
  restored: false
});

/**
 * CSS background for a photo layer. Until the client has restored the saved choice (SSR and
 * hydration), layers use --site-backdrop, which the app.html inline script points at the saved
 * photo before first paint (default in app.css). An explicit url here would make every visitor
 * download the default photo even when they picked another one.
 */
export function photoBackground(index: number) {
  return backdrop.restored ? `url('${photos[index]}')` : 'var(--site-backdrop)';
}

function remember(index: number) {
  try {
    localStorage.setItem(STORAGE_KEY, photos[index]);
  } catch {
    // Private mode can block storage. The choice still applies for this visit.
  }
}

/** Photos already requested in the background (not reactive state). */
const prefetched: string[] = [];

/** Slow or data-saving connections skip prefetching; the photo loads when it's picked. */
function canPrefetch() {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (!connection) return true;
  return !connection.saveData && !/(^|-)2g$/.test(connection.effectiveType ?? '');
}

/** Warm the cache for the photo the switch shows next, once the browser is idle. */
function prefetchNext() {
  const src = photos[(backdrop.index + 1) % photos.length];
  if (prefetched.includes(src) || !canPrefetch()) return;
  prefetched.push(src);
  const load = () => {
    const image = new Image();
    image.src = src;
  };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(load, { timeout: 3000 });
  else setTimeout(load, 1000);
}

export function cycleBackdrop() {
  const next = (backdrop.index + 1) % photos.length;
  backdrop.previous = backdrop.index;
  backdrop.index = next;
  remember(next);
  prefetchNext();
}

/** Called once, from the root layout. */
export function restoreBackdrop() {
  if (backdrop.restored) return;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const found = photos.findIndex((src) => src === saved);
    if (found >= 0) {
      backdrop.index = found;
      backdrop.previous = found;
    }
  } catch {
    // Use the glacier until storage is available.
  }
  backdrop.restored = true;

  // Same URL the inline script preloaded, so this decode reuses that download.
  const image = new Image();
  image.src = photos[backdrop.index];
  let cancelled = false;

  image
    .decode()
    .catch(() => undefined)
    .then(() => {
      if (cancelled) return;
      backdrop.revealed = true;
      prefetchNext();
    });

  return () => {
    cancelled = true;
  };
}
