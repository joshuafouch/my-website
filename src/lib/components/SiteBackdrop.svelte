<script lang="ts">
  import { onMount } from 'svelte';
  import { backdrop, photos, restoreBackdrop } from '#lib/backdrop.svelte.ts';

  // Coming back to the landing, the photo is already loaded: show it without fading in again.
  const startIndex = backdrop.index;
  let settled = $state(backdrop.revealed);

  $effect.pre(() => {
    if (backdrop.index !== startIndex) settled = false;
  });

  onMount(restoreBackdrop);
</script>

<div class="site-backdrop" class:ready={backdrop.revealed} aria-hidden="true">
  <div
    class="photo under"
    class:held={backdrop.previous !== backdrop.index}
    style:background-image="url('{photos[backdrop.previous]}')"
  ></div>
  {#key backdrop.index}
    <div
      class="photo over"
      class:shown={backdrop.revealed}
      class:settled
      style:background-image="url('{photos[backdrop.index]}')"
    ></div>
  {/key}
  <div class="veil"></div>
</div>

<svelte:head>
  <noscript>
    <style>
      .site-backdrop .over {
        opacity: 1 !important;
        animation: none !important;
      }
    </style>
  </noscript>
</svelte:head>
