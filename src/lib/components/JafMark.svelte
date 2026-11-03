<script lang="ts">
  import jafUrl from '#lib/assets/jaf.svg?url';
</script>

<!-- References the cached jaf.svg instead of inlining it. The outline follows currentColor via
     --jaf-outline; the red fill keeps its color. -->
<div class="jaf-mark" aria-hidden="true">
  <svg width="500" height="500" viewBox="0 0 375 374.999991" preserveAspectRatio="xMidYMid meet">
    <use href="{jafUrl}#jaf" />
  </svg>
</div>

<style>
  .jaf-mark {
    --jaf-outline: currentColor;
    color: inherit;
  }

  .jaf-mark svg {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
