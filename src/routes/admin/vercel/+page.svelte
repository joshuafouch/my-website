<script lang="ts">
  let { data } = $props();
  const infra = $derived(data.infra);

  function when(ms: number) {
    if (!ms) return '—';
    return new Date(ms).toLocaleString();
  }

  function formatVital(value: number | null, unit: string) {
    if (value == null) return '—';
    if (unit === 'ms') return `${Math.round(value)} ms`;
    return value.toFixed(3);
  }
</script>

<svelte:head>
  <title>Vercel</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Vercel</h1>
    <p class="note">{infra.note}</p>
  </div>
</header>

{#if infra.error}
  <p class="error">{infra.error}</p>
{/if}

<section class="obs-grid">
  {#each infra.vitals as vital (vital.id)}
    <article class="obs-stat">
      <p class="obs-label">{vital.label}</p>
      <p class="obs-value">{formatVital(vital.value, vital.unit)}</p>
    </article>
  {/each}
</section>

<section class="obs-panel">
  <h2>Recent deployments</h2>
  <ul class="obs-list">
    {#each infra.deployments as deploy (deploy.uid)}
      <li>
        <span>
          <strong>{deploy.state}</strong>
          {#if deploy.target}
            · {deploy.target}
          {/if}
          <span class="meta">{when(deploy.createdAt)}</span>
        </span>
        {#if deploy.url}
          <a class="quiet-link" href={`https://${deploy.url}`} target="_blank" rel="noreferrer"
            >{deploy.url}</a
          >
        {/if}
      </li>
    {:else}
      <li class="note">No deployments returned.</li>
    {/each}
  </ul>
</section>
