<script lang="ts">
  import jafUrl from '#lib/assets/jaf.svg?url';
</script>

<!-- References the cached jaf.svg instead of inlining its 28 KB into every page. The red ink
     follows currentColor (so it can drift) via --jaf-ink; the dark outline keeps its color. -->
<div class="jaf-crest" aria-hidden="true">
  <svg width="500" height="500" viewBox="0 0 375 374.999991" preserveAspectRatio="xMidYMid meet">
    <use href="{jafUrl}#jaf" />
  </svg>
</div>

<style>
  /* Hue shifts from nord8 land on red, yellow, green, then purple. Animating
     filter instead of color keeps the drift on the compositor: no repaints. */
  .jaf-crest {
    --jaf-ink: currentColor;
    color: var(--crest-color, var(--nord8));
    animation: crest-drift 30s ease-in-out infinite;
  }

  .jaf-crest svg {
    display: block;
    width: 100%;
    height: auto;
  }

  @keyframes crest-drift {
    0% {
      filter: hue-rotate(0deg);
    }

    20% {
      filter: hue-rotate(161deg);
    }

    40% {
      filter: hue-rotate(207deg);
    }

    60% {
      filter: hue-rotate(259deg);
    }

    80% {
      filter: hue-rotate(478deg);
    }

    100% {
      filter: hue-rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .jaf-crest {
      animation: none;
    }
  }

  :global(html[data-motion='off']) .jaf-crest {
    animation: none;
  }
</style>
