<script lang="ts">
  let {
    values = [],
    label = 'Trend'
  }: {
    values: number[];
    label?: string;
  } = $props();

  const width = 320;
  const height = 72;
  const pad = 4;

  const path = $derived.by(() => {
    if (values.length === 0) return '';
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const span = Math.max(max - min, 1);
    return values
      .map((value, index) => {
        const x =
          values.length === 1
            ? width / 2
            : pad + (index / (values.length - 1)) * (width - pad * 2);
        const y = height - pad - ((value - min) / span) * (height - pad * 2);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  });
</script>

<svg class="spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
  {#if path}
    <path d={path} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  {:else}
    <text x="12" y="40" fill="currentColor" font-size="12">No data yet</text>
  {/if}
</svg>

<style>
  .spark {
    display: block;
    width: 100%;
    height: auto;
    color: var(--ink-accent, #81a1c1);
  }
</style>
