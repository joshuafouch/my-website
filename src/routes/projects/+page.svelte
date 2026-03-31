<script lang="ts">
  import * as config from '$lib/config';
</script>

<svelte:head>
  <title>My Projects</title>
  <meta
    name="description"
    content="A collection of my professional, personal, and academic projects"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:title" content="My Projects" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{config.url}/projects" />
  <meta
    property="og:description"
    content="A collection of my professional, personal, and academic projects"
  />
  <meta property="og:image" content="{config.url}/assets/happy_snow.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="My Projects" />
  <meta property="og:site_name" content="Joshua Fouch" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="My Projects" />
  <meta
    name="twitter:description"
    content="A collection of my professional, personal, and academic projects"
  />
  <meta name="twitter:image" content="{config.url}/assets/happy_snow.webp" />

  <!-- Canonical URL -->
  <link rel="canonical" href="{config.url}/projects" />
</svelte:head>

<div
  class="hero h-[60vh] rounded-b-4xl bg-cover bg-bottom sm:bg-fixed sm:bg-center"
  style="background-image: url(/assets/happy_snow.webp);"
>
  <div class="hero-overlay rounded-b-4xl bg-black/60"></div>
  <div class="hero-content text-neutral-content pt-24 text-center">
    <div class="max-w-md">
      <h1 class="font-title mb-5 text-5xl font-bold">My Projects</h1>
      <p class="font-main text-accent mb-5 text-lg">
        Here are some of my professional, personal, and academic projects I have produced over the
        years. Most of these are GitHub links to the source code.
      </p>
    </div>
  </div>
</div>

<main class="bg-base-100 mx-auto max-w-4xl px-4 py-16">
  <div class="space-y-16">
    <section id="deeper-dive">
      <h2 class="font-title mb-6 text-center text-3xl font-semibold">Who art thou, Joshua?</h2>
      <div class="prose prose-lg font-main max-w-none text-center">
        Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
        pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
        aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
        Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
        aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem
        ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
        pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
        aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
        Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
        aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      </div>
    </section>

    <section id="more">
      <h2 class="font-title mb-6 text-center text-3xl font-semibold">
        Where art thou going, Joshua?
      </h2>
      <div class="font-main prose prose-lg max-w-none text-center">
        Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
        pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
        aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
        Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
        aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem
        ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
        pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu
        aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
        Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
        aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      </div>
    </section>
  </div>
</main>
