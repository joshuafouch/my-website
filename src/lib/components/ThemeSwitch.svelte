<script lang="ts">
  import { theme, toggleTheme } from '#lib/theme.svelte.ts';

  let { compact = false }: { compact?: boolean } = $props();
</script>

<button
  type="button"
  class="switch"
  class:compact
  aria-label={theme.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
  title={theme.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
  onclick={toggleTheme}
>
  {#if theme.current === 'dark'}
    <!-- Sun icon: active in dark mode to switch to light -->
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M12 2.5v2.25M12 19.25v2.25M5.28 5.28l1.6 1.6M17.12 17.12l1.6 1.6M2.5 12h2.25M19.25 12h2.25M5.28 18.72l1.6-1.6M17.12 6.88l1.6-1.6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  {:else}
    <!-- Moon icon: active in light mode to switch to dark -->
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>
  {/if}
</button>

<style>
  .switch {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid var(--btn-border);
    border-radius: 9999px;
    background: var(--btn-bg);
    color: var(--ink-muted);
    cursor: pointer;
    transition:
      color 200ms ease,
      border-color 200ms ease,
      background-color 200ms ease;
  }

  .switch svg {
    width: 1.05rem;
    height: 1.05rem;
    transition: transform 250ms ease;
  }

  .switch:hover,
  .switch:focus-visible {
    color: var(--ink);
    border-color: var(--border-strong);
    outline: none;
  }

  .switch:active svg {
    transform: scale(0.9) rotate(20deg);
  }

  .compact {
    width: 2rem;
    height: 2rem;
    background: transparent;
  }

  .compact svg {
    width: 0.95rem;
    height: 0.95rem;
  }
</style>
