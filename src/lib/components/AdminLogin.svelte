<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<a class="admin" href={resolve('/admin/login')} aria-label="Admin login">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3.15" fill="none" stroke="currentColor" stroke-width="1.6" />
    <path
      d="M5.2 19.4c1.15-3.35 3.55-4.9 6.8-4.9s5.65 1.55 6.8 4.9"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
    />
  </svg>
</a>

<style>
  .admin {
    display: grid;
    place-items: center;
    flex: none;
    width: 2.75rem;
    height: 2.75rem;
    border: 0;
    border-radius: 0;
    background: none;
    color: var(--ink-muted);
    cursor: pointer;
    transition:
      color 200ms ease,
      border-color 200ms ease,
      background-color 200ms ease;
  }

  .admin svg {
    width: 1.05rem;
    height: 1.05rem;
  }

  .admin:hover,
  .admin:focus-visible {
    color: var(--ink);
    border-color: var(--border-strong);
    outline: none;
  }
</style>
