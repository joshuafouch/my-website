import { reducedMotion } from '#lib/motion.svelte.ts';

const STORAGE_KEY = 'site-theme';

const THEME_ORDER = ['polar-night', 'snow-storm', 'frost'] as const;

export type ThemeMode = (typeof THEME_ORDER)[number];

export const THEME_LABELS: Record<ThemeMode, string> = {
  'polar-night': 'Polar Night',
  'snow-storm': 'Snow Storm',
  frost: 'Frost'
};

const DAISY_THEME: Record<ThemeMode, string> = {
  'polar-night': 'nord-dark',
  'snow-storm': 'nord',
  frost: 'frost'
};

const COLOR_SCHEME: Record<ThemeMode, 'dark' | 'light'> = {
  'polar-night': 'dark',
  'snow-storm': 'light',
  frost: 'dark'
};

const LEGACY: Record<string, ThemeMode> = {
  dark: 'polar-night',
  light: 'snow-storm',
  'polar-night': 'polar-night',
  'snow-storm': 'snow-storm',
  frost: 'frost'
};

export const theme = $state<{ current: ThemeMode }>({
  current: 'polar-night'
});

export function nextTheme(mode: ThemeMode): ThemeMode {
  const index = THEME_ORDER.indexOf(mode);
  return THEME_ORDER[(index + 1) % THEME_ORDER.length];
}

function readTheme(saved: string | null): ThemeMode {
  if (saved && saved in LEGACY) return LEGACY[saved];
  return 'polar-night';
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', DAISY_THEME[mode]);
  root.classList.remove('dark', 'light', 'polar-night', 'snow-storm', 'frost');
  root.classList.add(mode);
  root.style.colorScheme = COLOR_SCHEME[mode];
}

function persist(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage may be unavailable in private browsing
  }
}

export function toggleTheme() {
  const next = nextTheme(theme.current);
  const apply = () => {
    theme.current = next;
    applyTheme(next);
    persist(next);
  };

  if (typeof document === 'undefined' || reducedMotion()) {
    apply();
    return;
  }

  const root = document.documentElement;

  // Phones (and browsers without View Transitions) swap in one frame. On iOS Safari a snapshot
  // crossfade shows the status-bar and toolbar strips in the new colour while the old screenshot
  // fades, and the drifting signature and crest flash their snapshot hue before snapping back.
  const narrow = window.matchMedia('(max-width: 767px)').matches;
  if (narrow || typeof document.startViewTransition !== 'function') {
    // Suppress colour transitions just for this style change: flush with the attribute set,
    // then drop it so nothing tweens from the old theme.
    root.dataset.themeFade = 'instant';
    apply();
    void getComputedStyle(root).color;
    delete root.dataset.themeFade;
    return;
  }

  // Wider screens: one crossfade. Interpolating color and the signature filter repaints a lot.
  root.dataset.themeFade = 'vt';
  const clear = () => delete root.dataset.themeFade;

  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(async () => {
      apply();
      await Promise.resolve();
    });
  } catch {
    apply();
    clear();
    return;
  }

  transition.finished.then(clear, clear);
}

export function restoreTheme() {
  if (typeof window === 'undefined') return;
  let saved: string | null = null;
  let mode: ThemeMode;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
    mode = readTheme(saved);
  } catch {
    mode = 'polar-night';
  }
  theme.current = mode;
  applyTheme(mode);
  if (saved === 'dark' || saved === 'light') persist(mode);
}
