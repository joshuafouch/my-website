<script lang="ts">
  import Sparkline from '#lib/components/admin/Sparkline.svelte';

  let { data } = $props();
  const traffic = $derived(data.traffic);
  const spark = $derived(traffic.daily.map((row) => row.visitors));
</script>

<svelte:head>
  <title>Traffic</title>
</svelte:head>

<header class="head">
  <div>
    <h1>Traffic</h1>
    <p class="note">
      Anonymous visitors via free Vercel Web Analytics (no cookies, no personal IDs). {traffic.since}
      →
      {traffic.until}
    </p>
  </div>
</header>

{#if traffic.error}
  <p class="error">{traffic.error}</p>
{/if}

<section class="obs-grid">
  <article class="obs-stat">
    <p class="obs-label">Visitors</p>
    <p class="obs-value">{traffic.visitors}</p>
  </article>
  <article class="obs-stat">
    <p class="obs-label">Pageviews</p>
    <p class="obs-value">{traffic.pageviews}</p>
  </article>
  <article class="obs-stat">
    <p class="obs-label">Avg / day</p>
    <p class="obs-value">{traffic.avgDailyVisitors}</p>
  </article>
</section>

<section class="obs-panel">
  <h2>Daily visitors</h2>
  <Sparkline values={spark} label="Daily visitors" />
</section>

<section class="obs-columns">
  <div class="obs-panel">
    <h2>Top pages</h2>
    <ul class="obs-list">
      {#each traffic.paths as row (row.label)}
        <li>
          <span>{row.label}</span>
          <span class="meta">{row.visitors} visitors · {row.pageviews} views</span>
        </li>
      {:else}
        <li class="note">No page data yet.</li>
      {/each}
    </ul>
  </div>
  <div class="obs-panel">
    <h2>Countries</h2>
    <ul class="obs-list">
      {#each traffic.countries as row (row.label)}
        <li>
          <span>{row.label}</span>
          <span class="meta">{row.visitors}</span>
        </li>
      {:else}
        <li class="note">No country data yet.</li>
      {/each}
    </ul>
  </div>
  <div class="obs-panel">
    <h2>Referrers</h2>
    <ul class="obs-list">
      {#each traffic.referrers as row (row.label)}
        <li>
          <span>{row.label || '(direct)'}</span>
          <span class="meta">{row.visitors}</span>
        </li>
      {:else}
        <li class="note">No referrer data yet.</li>
      {/each}
    </ul>
  </div>
  <div class="obs-panel">
    <h2>Devices</h2>
    <ul class="obs-list">
      {#each traffic.devices as row (row.label)}
        <li>
          <span>{row.label}</span>
          <span class="meta">{row.visitors}</span>
        </li>
      {:else}
        <li class="note">No device data yet.</li>
      {/each}
    </ul>
  </div>
</section>
