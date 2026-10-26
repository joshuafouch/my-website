<script lang="ts">
  import { THEME_LABELS, nextTheme, theme, toggleTheme } from '#lib/theme.svelte.ts';

  let { compact = false }: { compact?: boolean } = $props();

  const label = $derived(
    `${THEME_LABELS[theme.current]} theme. Switch to ${THEME_LABELS[nextTheme(theme.current)]}.`
  );
</script>

<button
  type="button"
  class="switch"
  class:compact
  aria-label={label}
  title={label}
  onclick={toggleTheme}
>
  {#if theme.current === 'polar-night'}
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.5 16.75h17"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M8.2 16.4a4.1 4.1 0 0 1 7.3-3.7 3.15 3.15 0 0 0-7.3 3.7z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="M17.1 4.4v2.3M15.95 5.55h2.3"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  {:else if theme.current === 'snow-storm'}
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v18M12 3 9.8 5.4M12 3l2.2 2.4M12 21l-2.2-2.4M12 21l2.2-2.4M4.6 7.4l14.8 9.2M4.6 7.4l2.6.2M4.6 7.4l.7 2.5M19.4 16.6l-2.6-.2M19.4 16.6l-.7-2.5M19.4 7.4 4.6 16.6M19.4 7.4l-2.6.2M19.4 7.4l-.7 2.5M4.6 16.6l2.6-.2M4.6 16.6l.7-2.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.5 6.5h17"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M6.5 6.5 8 16.2 9.5 6.5M11 6.5 13 19 15 6.5M16.5 6.5 17.7 13.6 19 6.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
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
