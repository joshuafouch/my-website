<script lang="ts">
  type Turn = { label: string; title: string; href: string } | null;

  let {
    previous = null,
    next = null,
    label
  }: { previous?: Turn; next?: Turn; label: string } = $props();
</script>

{#if previous || next}
  <nav class="turn font-serif" aria-label={label}>
    {#if previous}
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by the caller -->
      <a href={previous.href}>
        <span class="font-mono">← {previous.label}</span>
        <span class="title">{previous.title}</span>
      </a>
    {:else}
      <span></span>
    {/if}
    {#if next}
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by the caller -->
      <a class="next" href={next.href}>
        <span class="font-mono">{next.label} →</span>
        <span class="title">{next.title}</span>
      </a>
    {/if}
  </nav>
{/if}

<style>
  .turn {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
    margin-top: 4.5rem;
    border-top: 1px solid var(--border-strong);
  }

  a {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1.25rem 0;
    color: var(--ink);
    text-decoration: none;
  }

  .next {
    align-items: flex-end;
    text-align: right;
  }

  .font-mono {
    color: var(--ink-faint);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  .title {
    font-size: 1.45rem;
    font-weight: 500;
    line-height: 1.25;
    transition: color 180ms ease;
  }

  a:hover .title,
  a:focus-visible .title {
    color: var(--ink-accent);
  }

  a:focus-visible {
    outline: none;
  }

  @media (max-width: 559px) {
    .turn {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }

    .next {
      align-items: flex-start;
      text-align: left;
      border-top: 1px solid var(--border-subtle);
    }
  }
</style>
