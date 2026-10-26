import { reducedMotion } from '#lib/motion.svelte.ts';

const STORAGE_KEY = 'site-theme';

export const THEME_ORDER = ['polar-night', 'snow-storm', 'frost'] as const;

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

export function applyTheme(mode: ThemeMode) {
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
  root.dataset.themeFade = '';

  // One crossfade. Interpolating color and the signature filter repaints thousands of paths.
  if (typeof document.startViewTransition !== 'function') {
    apply();
    requestAnimationFrame(() => delete root.dataset.themeFade);
    return;
  }

  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(async () => {
      apply();
      await Promise.resolve();
    });
  } catch {
    apply();
    delete root.dataset.themeFade;
    return;
  }

  const clear = () => delete root.dataset.themeFade;
  transition.finished.then(clear, clear);
}

export function setTheme(mode: ThemeMode) {
  theme.current = mode;
  applyTheme(mode);
  persist(mode);
}

export function restoreTheme() {
  if (typeof window === 'undefined') return;
  let saved: string | null = null;
  let mode: ThemeMode = 'polar-night';
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
