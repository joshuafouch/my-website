const STORAGE_KEY = 'site-backdrop';

export const photos = [
  '/assets/hero-bg.webp',
  '/assets/valleybutte.webp',
  '/assets/thunderbirdfalls.webp',
  '/assets/happy_snow.webp'
] as const;

export const backdrop = $state({
  index: 0,
  previous: 0,
  revealed: false
});

function remember(index: number) {
  try {
    localStorage.setItem(STORAGE_KEY, photos[index]);
  } catch {
    // Private mode can block storage. The choice still applies for this visit.
  }
}

export function cycleBackdrop() {
  const next = (backdrop.index + 1) % photos.length;
  backdrop.previous = backdrop.index;
  backdrop.index = next;
  remember(next);
}

export function restoreBackdrop() {
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

  const current = photos[backdrop.index];
  const image = new Image();
  image.src = current;
  let cancelled = false;

  image
    .decode()
    .catch(() => undefined)
    .then(() => {
      if (cancelled) return;
      backdrop.revealed = true;
      for (const src of photos) {
        if (src === current) continue;
        const next = new Image();
        next.src = src;
      }
    });

  return () => {
    cancelled = true;
  };
}
