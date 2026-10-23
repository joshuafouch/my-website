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
    view-transition-name: backdrop-switch;
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 35%, transparent);
    border-radius: 9999px;
    background: color-mix(in oklab, var(--ground) 55%, transparent);
    color: var(--ink-muted);
    cursor: pointer;
  }

  .switch svg {
    width: 1.05rem;
    height: 1.05rem;
  }

  .switch:hover,
  .switch:focus-visible {
    color: var(--ink);
    border-color: var(--nord4);
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
