<script lang="ts" module>
  /** One aurora character cell, in px of the 1440px-wide design the curtain is shaped on. */
  const CW = 8.4;
  const CH = 13;
  const ROWS = 34;
  /** Inner pages: sky px per screen px, so the hem (~250px down the sky) sits ~215px down. */
  const INNER_STRETCH = 1.18;
  /** Inner pages: a stronger curtain, denser glyphs, though still quieter than the landing's. */
  const INNER_GAIN = 1.45;
  const DESIGN_WIDTH = 1440;
  const RAMP = ' .·:-=+*#';
  /** Redraws per second are low on purpose: the sky changes slowly, a few frames a second. */
  const FRAME_MS = 400;
  /** Sky time per frame; the curtain moves half a column per unit of it. */
  const STEP = 0.4;
  const FLOW = 0.5;

  /** A small seeded generator, so the sky is the same on every visit. */
  function seeded(seed: number) {
    let state = seed;
    return () => {
      state = (state * 16807) % 2147483647;
      return state / 2147483647;
    };
  }

  // Ray strengths per column, smoothed so neighbouring rays blend.
  const RAYS = (() => {
    const random = seeded(7);
    const raw = Array.from({ length: 400 }, () => 0.3 + 0.7 * random());
    return raw.map((_, i) => (raw[(i + 399) % 400] + raw[i] + raw[(i + 1) % 400]) / 3);
  })();

  /** A star-field tile as an SVG data URI: white glyphs used as a mask, coloured by a token. */
  function starTile(seed: number, count: number) {
    const random = seeded(seed);
    const size = 640;
    let glyphs = '';
    for (let i = 0; i < count; i++) {
      const x = Math.round(random() * size);
      const y = Math.round(random() * size);
      const alpha = (0.3 + random() * 0.6).toFixed(2);
      const cross = random() < 0.16;
      glyphs += `<text x='${x}' y='${y}' fill-opacity='${alpha}' font-size='${cross ? 11 : 15}'>${cross ? '+' : '·'}</text>`;
    }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' font-family='ui-monospace, Menlo, monospace' fill='white'>${glyphs}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  const STARS_A = starTile(11, 34);
  const STARS_B = starTile(23, 26);

  /* A small waning crescent (lit on the left) made of the same '·' dots as the star field, so it
     reads as part of the sky. Revelation 12:1's moon, kept quiet. */
  const MOON_SIZE = 12;
  const MOON_DOTS: [number, number][] = [];
  for (let y = 0; y < MOON_SIZE; y++) {
    for (let x = 0; x < MOON_SIZE; x++) {
      const lit = Math.hypot(x - 5.5, y - 5.5) <= 5.7;
      const shadow = Math.hypot(x - 8.4, y - 5) <= 5.2;
      if (lit && !shadow) MOON_DOTS.push([x, y]);
    }
  }

  // The Alaska flag: the Big Dipper's seven stars and Polaris, placed as on the flag, drawn with
  // the star field's own '+' so they belong to the same sky.
  const DIPPER = [
    [35, 67],
    [67, 78],
    [83, 95],
    [100, 113],
    [97, 138],
    [134, 148],
    [147, 128]
  ];
  const POLARIS = [210, 26];
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { reducedMotion } from '#lib/motion.svelte.ts';
  import { theme } from '#lib/theme.svelte.ts';

  type Props = {
    /** The landing gets the full sky (and the Dipper and moon); inner pages a faint cap. */
    variant?: 'landing' | 'inner';
  };

  let { variant = 'inner' }: Props = $props();

  let canvas: HTMLCanvasElement | undefined = $state();
  let mounted = $state(false);
  let time = 0;
  let timer = 0;

  // Cached between frames so a redraw never forces a style or layout pass: the canvas's size
  // (kept by the ResizeObserver) and the aurora colours (re-read only around a theme change).
  let context: CanvasRenderingContext2D | null = null;
  let width = 0;
  let height = 0;
  let colors: string[] | null = null;
  let colorsUntil = 0;
  /** Off screen (an inner page scrolled past its header): the timer keeps time but skips drawing. */
  let visible = true;

  /** The motion button (html[data-motion='off']) or the OS setting holds the sky still. */
  const still = $derived(reducedMotion());

  function draw() {
    if (!canvas) return;
    context ??= canvas.getContext('2d');
    if (!context || !width || !height) return;

    const ratio = window.devicePixelRatio || 1;
    if (
      canvas.width !== Math.round(width * ratio) ||
      canvas.height !== Math.round(height * ratio)
    ) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }

    const phone = width < 640;
    const scale = phone ? 0.75 : 1;
    if (!colors || performance.now() < colorsUntil) {
      const style = getComputedStyle(canvas);
      colors = [1, 2, 3, 4].map((n) => style.getPropertyValue(`--aurora-${n}`).trim());
    }
    // Canvas state changes cost more than the glyphs: set them only when they change.
    let lastColor = -1;
    let lastAlpha = -1;

    context.setTransform(ratio * scale, 0, 0, ratio * scale, 0, 0);
    context.clearRect(0, 0, width / scale, height / scale);
    context.font = `${CH}px 'IBM Plex Mono', ui-monospace, monospace`;
    context.textBaseline = 'top';

    const cols = Math.ceil(width / (CW * scale)) + 2;
    // The landing's aurora fills the whole screen: the screen's height maps onto the top 340px of
    // the curtain's sky, so its hem sits about three quarters of the way down and its rays reach
    // the top. Inner pages keep it as a short band at the top, squeezed a little so the bright hem
    // lands inside the band rather than under its fade.
    const fill = variant === 'landing';
    const rows = fill
      ? Math.ceil(height / (CH * scale))
      : Math.min(ROWS, Math.ceil(height / (CH * scale)));
    const stretch = fill ? 340 / Math.max(rows * CH, 1) : INNER_STRETCH;
    const offset = (DESIGN_WIDTH - cols * CW) / 2;
    const shift = Math.floor(time * FLOW) * CW; // whole-column steps, like a terminal redraw
    const centreFade = phone || fill ? 0.2 : 0.45;
    const S = Math.sin;

    for (let c = 0; c < cols; c++) {
      const x = offset + c * CW; // on screen
      const wx = x - shift; // in the moving sky
      const hem =
        250 +
        55 * S(wx * 0.0035 + 0.6 + 0.012 * time) +
        22 * S(wx * 0.011 + 2.0 - 0.02 * time) -
        0.06 * x;
      const ray = RAYS[((Math.floor(wx / CW) % 400) + 400) % 400];
      const across =
        (1 - centreFade + centreFade * Math.abs((x - DESIGN_WIDTH / 2) / (DESIGN_WIDTH / 2))) *
        (0.4 + 0.6 * (0.5 + 0.5 * S(wx * 0.006 - 1.2)));

      for (let r = 0; r < rows; r++) {
        const y = r * CH * stretch + 14;
        let strength =
          y <= hem ? 1.7 * Math.exp(-(hem - y) / 150) * ray : 1.7 * Math.exp(-(y - hem) / 16) * ray;
        strength *= fill ? across : across * INNER_GAIN;
        let level = Math.min(RAMP.length - 1, Math.floor(strength * 8 * 1.15));
        if (level > 0 && Math.random() < 0.006) {
          level = Math.max(0, Math.min(RAMP.length - 1, level + (Math.random() < 0.5 ? -1 : 1)));
        }
        if (level === 0) continue;

        const above = (hem - y) / 160;
        const color = above < 0.35 ? 0 : above < 0.8 ? 1 : above < 1.3 ? 2 : 3;
        if (color !== lastColor) {
          context.fillStyle = colors[color];
          lastColor = color;
        }
        const alpha = Math.min(0.22 + 0.45 * strength, 0.7);
        if (alpha !== lastAlpha) {
          context.globalAlpha = alpha;
          lastAlpha = alpha;
        }
        context.fillText(RAMP[level], c * CW, r * CH);
      }
    }
    context.globalAlpha = 1;
  }

  function stop() {
    window.clearInterval(timer);
    timer = 0;
  }

  function start() {
    if (timer) return;
    timer = window.setInterval(() => {
      time += STEP;
      if (document.hidden || !visible) return;
      draw();
    }, FRAME_MS);
  }

  onMount(() => {
    mounted = true;
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      draw();
    });
    const seen = new IntersectionObserver(([entry]) => {
      const wasHidden = !visible;
      visible = entry.isIntersecting;
      if (visible && wasHidden) draw();
    });
    if (canvas) {
      resize.observe(canvas);
      seen.observe(canvas);
    }
    // The aurora's face may still be loading; redraw once it is in.
    void document.fonts?.load(`${CH}px 'IBM Plex Mono'`).then(() => draw());
    return () => {
      resize.disconnect();
      seen.disconnect();
      stop();
    };
  });

  // Run, or hold one still frame, as the motion setting changes.
  $effect(() => {
    if (!mounted) return;
    if (still) stop();
    else start();
    draw();
  });

  // A theme change fades its colours over ~320ms (theme.svelte.ts); redraw during and after it.
  $effect(() => {
    void theme.current;
    if (!mounted) return;
    colorsUntil = performance.now() + 400;
    draw();
    const settle = window.setTimeout(draw, 360);
    return () => window.clearTimeout(settle);
  });
</script>

<div class="night-sky {variant}" aria-hidden="true">
  <div class="star-field">
    <div class="stars a" style:--tile={STARS_A}></div>
    <div class="stars b" style:--tile={STARS_B}></div>
  </div>

  <div class="aurora">
    <canvas bind:this={canvas}></canvas>
  </div>

  {#if variant === 'landing'}
    <svg class="dipper" viewBox="20 8 210 158">
      {#each DIPPER as [x, y] (`${x},${y}`)}
        <text {x} {y} class="star">+</text>
      {/each}
      <text x={POLARIS[0]} y={POLARIS[1]} class="star polaris">+</text>
      <text x="210" y="48" class="label" text-anchor="middle">polaris</text>
      <text x="22" y="160" class="label">ursa major</text>
    </svg>

    <div class="moon">
      <svg class="moon-art" viewBox="-1 -1 {MOON_SIZE + 1} {MOON_SIZE + 1}">
        {#each MOON_DOTS as [x, y] (`${x},${y}`)}
          <circle cx={x} cy={y} r="0.32" />
        {/each}
      </svg>
      <span class="moon-ref">rev 12:1</span>
    </div>
  {/if}
</div>

<style>
  /* Behind everything in its stacking context (the landing, or the inner pages' .page-stack). */
  .night-sky {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    /* Its size comes from inset, never its content: nothing inside can cause layout or paint
       work outside it. */
    contain: strict;
  }

  /* Stars: two tiles of white glyphs used as masks over the star colour, so they follow the
     theme and repeat down a page of any length at their real size. */
  .star-field {
    position: absolute;
    inset: 0;
  }

  .stars {
    position: absolute;
    inset: 0;
    background-color: var(--star-ink);
    mask-image: var(--tile);
    mask-repeat: repeat;
    mask-size: 640px 640px;
    animation: twinkle 9s ease-in-out infinite alternate;
    /* Own layers, so the twinkle only fades them on the GPU and never re-rasterises the masks. */
    will-change: opacity;
  }

  .stars.b {
    mask-position: 300px 180px;
    animation-duration: 13s;
    animation-delay: -6s;
  }

  @keyframes twinkle {
    from {
      opacity: 0.45;
    }
    to {
      opacity: 1;
    }
  }

  .aurora {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 100%;
    opacity: var(--aurora-opacity);
    mask-image: linear-gradient(to bottom, #000 85%, transparent);
  }

  .aurora canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* Inner pages: stars only in the margins beside the reading column, and a fainter, shorter
     aurora that fades out before the page heading. */
  /* The inner pages' column (.page-stack) is a sidebar's width narrower than the screen and,
     with the sidebar closed, only slid over by the rail: the sky runs on past its right edge to
     the screen's (the shell clips the overflow when the sidebar is open). */
  .inner {
    --reach: calc(var(--sidebar-width) - var(--rail-mini));
    right: calc(-1 * var(--reach));
  }

  /* Stars only in the margins: --column is the centre of the reading column, in this box. */
  .inner .star-field {
    opacity: 0.55;
    --column: calc((100% - var(--reach)) / 2);
    --gutter-left: calc(var(--column) - var(--page-width) / 2);
    --gutter-right: calc(var(--column) + var(--page-width) / 2);
    mask-image: linear-gradient(
      90deg,
      #000 0,
      #000 calc(var(--gutter-left) - 3rem),
      transparent var(--gutter-left),
      transparent var(--gutter-right),
      #000 calc(var(--gutter-right) + 3rem)
    );
  }

  .inner .aurora {
    height: 22rem;
    opacity: calc(var(--aurora-opacity) * 0.95);
    mask-image: linear-gradient(to bottom, #000 58%, transparent);
  }

  .dipper {
    position: absolute;
    top: max(110px, 24%);
    left: max(16px, calc((50% - 27rem) / 2 - 84px));
    width: 168px;
    height: auto;
    overflow: visible;
  }

  .dipper .star {
    fill: var(--star-ink);
    font-size: 17px;
    text-anchor: middle;
    dominant-baseline: central;
  }

  .dipper .polaris {
    font-size: 24px;
  }

  .dipper .label {
    fill: var(--ink-faint);
    font-size: 9px;
    letter-spacing: 0.06em;
  }

  .moon {
    position: absolute;
    top: max(90px, 13%);
    right: max(16px, calc((50% - 27rem) / 2 - 56px));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    color: var(--moon-ink);
  }

  .moon-art {
    width: 30px;
    height: auto;
    overflow: visible;
    fill: var(--moon-ink);
  }

  .moon-ref {
    font-size: 7px;
    letter-spacing: 0.12em;
    color: var(--ink-faint);
  }

  @media (max-width: 767px) {
    .inner {
      --reach: 0px;
    }

    /* Phones have no margins beside the text: stars only in the thin edges outside its padding,
       and across the foot of the page (part of the page, so they scroll with it). */
    .inner .star-field {
      opacity: 0.85;
      mask-image:
        linear-gradient(
          90deg,
          #000 0,
          #000 0.9rem,
          transparent 1.35rem,
          transparent calc(100% - 1.35rem),
          #000 calc(100% - 0.9rem)
        ),
        linear-gradient(to bottom, transparent calc(100% - 18rem), #000 calc(100% - 8rem));
      mask-composite: add;
    }

    /* A denser tile on phones, so the thin edges still catch a few stars. */
    .inner .stars {
      mask-size: 460px 460px;
    }

    .inner .aurora {
      height: 16rem;
    }

    .dipper {
      top: 68px;
      left: 14px;
      width: 118px;
    }

    .moon {
      top: 80px;
      right: 20px;
    }

    .moon-art {
      width: 26px;
    }

    .moon-ref {
      font-size: 6px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stars {
      animation: none;
    }
  }

  :global(html[data-motion='off']) .stars {
    animation: none;
  }
</style>
