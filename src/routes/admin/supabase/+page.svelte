<script lang="ts">
  import Sparkline from '#lib/components/admin/Sparkline.svelte';
  import { formatBytes } from '#lib/format-bytes.ts';

  let { data } = $props();
  const usage = $derived(data.usage);
  const apiSpark = $derived(
    usage.apiCounts.map((row) => row.rest + row.storage + row.auth + row.realtime)
  );
</script>

<svelte:head>
  <title>Supabase</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Supabase</h1>
    <p class="note">{usage.note}</p>
  </div>
</header>

{#if usage.error}
  <p class="error">{usage.error}</p>
{/if}

<section class="obs-grid">
  <article class="obs-stat">
    <p class="obs-label">Database</p>
    <p class="obs-value">{formatBytes(usage.databaseBytes)}</p>
  </article>
  <article class="obs-stat">
    <p class="obs-label">Disk used</p>
    <p class="obs-value">{formatBytes(usage.disk?.usedBytes)}</p>
  </article>
  <article class="obs-stat">
    <p class="obs-label">Disk free</p>
    <p class="obs-value">{formatBytes(usage.disk?.availBytes)}</p>
  </article>
  <article class="obs-stat">
    <p class="obs-label">Storage total</p>
    <p class="obs-value"
      >{formatBytes(usage.buckets.reduce((sum, bucket) => sum + bucket.bytes, 0))}</p
    >
  </article>
</section>

<section class="obs-columns">
  <div class="obs-panel">
    <h2>Buckets</h2>
    <ul class="obs-list">
      {#each usage.buckets as bucket (bucket.bucket)}
        <li>
          <span>{bucket.bucket}</span>
          <span class="meta"
            >{formatBytes(bucket.bytes)} · {bucket.objects} object{bucket.objects === 1
              ? ''
              : 's'}</span
          >
        </li>
      {/each}
    </ul>
  </div>
  <div class="obs-panel">
    <h2>Tables</h2>
    <ul class="obs-list">
      {#each usage.tableCounts as row (row.table)}
        <li>
          <span>{row.table}</span>
          <span class="meta">{row.count} row{row.count === 1 ? '' : 's'}</span>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="obs-panel">
  <h2>API requests</h2>
  {#if usage.apiCounts.length}
    <Sparkline values={apiSpark} label="API requests" />
    <ul class="obs-list">
      {#each usage.apiCounts.slice(-7) as row (row.timestamp)}
        <li>
          <span>{row.timestamp.slice(0, 10)}</span>
          <span class="meta"
            >REST {row.rest} · Storage {row.storage} · Auth {row.auth} · Realtime {row.realtime}</span
          >
        </li>
      {/each}
    </ul>
  {:else if !usage.configured}
    <p class="note">API charts appear after SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF are set.</p>
  {:else}
    <p class="note">No API request samples returned yet (or the token is missing Usage Analytics Read).</p>
  {/if}
</section>
