<script lang="ts">
  import raw from '../../../static/assets/jaf.svg?raw';

  // Ink takes currentColor so it can drift; the clip is dropped so a hidden copy can't break the other.
  const crest = raw
    .replaceAll('fill="#bf616a"', 'fill="currentColor"')
    .replace(/ clip-path="url\(#[^)]+\)"/, '');
</script>

<div class="jaf-crest" aria-hidden="true">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- bundled SVG asset, not user input -->
  {@html crest}
</div>

<style>
  /* Hue shifts from nord8 land on red, yellow, green, then purple. Animating
     filter instead of color keeps the drift on the compositor: no repaints. */
  .jaf-crest {
    color: var(--nord8);
    animation: crest-drift 30s ease-in-out infinite;
  }

  .jaf-crest :global(svg) {
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
