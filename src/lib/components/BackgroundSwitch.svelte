<script lang="ts">
  import { cycleBackdrop } from '#lib/backdrop.svelte.ts';

  let { compact = false }: { compact?: boolean } = $props();
</script>

<button
  type="button"
  class="switch"
  class:compact
  aria-label="Change background"
  onclick={cycleBackdrop}
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M2.5 18.5 8.5 8l4 6 2.5-3.5L21.5 18.5"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
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
  }

  .switch:hover,
  .switch:focus-visible {
    color: var(--ink);
    border-color: var(--border-strong);
    outline: none;
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
