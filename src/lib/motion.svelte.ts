const STORAGE_KEY = 'site-motion';

export const motion = $state({ off: false });

function apply() {
  if (motion.off) document.documentElement.dataset.motion = 'off';
  else delete document.documentElement.dataset.motion;
}

export function restoreMotion() {
  try {
    motion.off = localStorage.getItem(STORAGE_KEY) === 'off';
  } catch {
    motion.off = document.documentElement.dataset.motion === 'off';
  }
  apply();
}

export function toggleMotion() {
  motion.off = !motion.off;
  apply();
  try {
    localStorage.setItem(STORAGE_KEY, motion.off ? 'off' : 'on');
  } catch {
    // The choice still applies until the page is reloaded.
  }
}

/** True when the visitor paused motion, or the OS asks for less motion. */
export function reducedMotion() {
  if (motion.off) return true;
  if (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'off') {
    return true;
  }
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
