const STORAGE_KEY = 'site-theme';

export type ThemeMode = 'dark' | 'light';

export const theme = $state<{ current: ThemeMode }>({
  current: 'dark'
});

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const daisyTheme = mode === 'dark' ? 'nord-dark' : 'nord';
  root.setAttribute('data-theme', daisyTheme);
  root.classList.toggle('dark', mode === 'dark');
  root.classList.toggle('light', mode === 'light');
  root.style.colorScheme = mode;
}

export function toggleTheme() {
  const next: ThemeMode = theme.current === 'dark' ? 'light' : 'dark';
  theme.current = next;
  applyTheme(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage may be unavailable in private browsing
  }
}

export function setTheme(mode: ThemeMode) {
  theme.current = mode;
  applyTheme(mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage may be unavailable
  }
}

export function restoreTheme() {
  if (typeof window === 'undefined') return;
  let mode: ThemeMode = 'dark';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      mode = saved;
    }
  } catch {
    // Default to dark mode
    mode = 'dark';
  }
  theme.current = mode;
  applyTheme(mode);
}
