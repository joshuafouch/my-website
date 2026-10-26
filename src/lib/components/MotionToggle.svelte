<script lang="ts">
  import { motion, toggleMotion } from '#lib/motion.svelte.ts';

  let { compact = false }: { compact?: boolean } = $props();
</script>

<button
  type="button"
  class="motion"
  class:compact
  aria-pressed={motion.off}
  aria-label={motion.off ? 'Play animations' : 'Pause animations'}
  onclick={toggleMotion}
>
  <svg class="pause" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M8.5 5.5v13M15.5 5.5v13"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
    />
  </svg>
  <svg class="play" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M9 7.25 16.25 12 9 16.75Z"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</button>

<style>
  .motion {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: none;
    color: var(--ink-muted);
    cursor: pointer;
    transition: color 200ms ease;
  }

  .motion svg {
    grid-area: 1 / 1;
    width: 1.05rem;
    height: 1.05rem;
  }

  .play {
    display: none;
  }

  :global(html[data-motion='off']) .pause {
    display: none;
  }

  :global(html[data-motion='off']) .play {
    display: block;
  }

  .motion:hover,
  .motion:focus-visible {
    color: var(--ink);
  }

  .motion:focus-visible {
    outline: 1px solid var(--nord4);
    outline-offset: 3px;
  }

  .compact {
    width: 2rem;
    height: 2rem;
  }

  .compact svg {
    width: 0.95rem;
    height: 0.95rem;
  }
</style>
