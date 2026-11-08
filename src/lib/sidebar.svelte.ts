const STORAGE_KEY = 'site-sidebar';

export const sidebar = $state({ open: true });

export function restoreSidebar() {
  try {
    if (localStorage.getItem(STORAGE_KEY) === 'closed') sidebar.open = false;
  } catch {
    // Private mode can block storage. The bar stays open for this visit.
  }
}

export function toggleSidebar() {
  sidebar.open = !sidebar.open;
  try {
    localStorage.setItem(STORAGE_KEY, sidebar.open ? 'open' : 'closed');
  } catch {
    // The choice still applies until the page is reloaded.
  }
}
