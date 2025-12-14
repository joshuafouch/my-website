<script lang="ts">
  import { formatDate } from '$lib/utils';
  let { data } = $props();
</script>

<div
  class="hero relative min-h-screen rounded-b-4xl bg-cover bg-bottom sm:bg-fixed sm:bg-center"
  style="background-image: url('/assets/hero-bg.webp');"
>
  <div class="hero-overlay bg-neutral/80 rounded-b-4xl"></div>
  <div class="hero-content text-neutral-content text-center">
    <div class="max-w-md">
      <img class="img pb-2" src="/assets/JF_logo_light.webp" alt="signature" />
      <p class="font-title mb-2 text-xl">
        Greetings! My name is <span class="font-semibold italic">Joshua Fouch</span>. A third-year
        <span class="text-accent">Computer Science</span>
        undergrad minoring in
        <span class="text-accent">Cybersecurity</span>. Welcome to my digital portfolio and have a
        pleasant stay!
      </p>
    </div>
  </div>
</div>

<div id="about" class="text-neutral-content container mx-auto max-w-5xl p-8">
  <div class="card bg-base-300 mt-8 p-8 text-center shadow-xl">
    <h2 class="font-title mb-4 text-3xl font-semibold">About Me</h2>
    <div class="flex flex-col items-center sm:flex-row sm:space-x-8">
      <div class="avatar mb-4 sm:mb-0">
        <div class="ring-primary ring-offset-secondary w-64 rounded-full ring ring-offset-2">
          <img src="/assets/joshpfp.jpg" alt="Your Name" />
        </div>
      </div>
      <p class="font-main flex-grow text-lg sm:text-left">
        I am a third-year at Franciscan University of Steubenville studying Computer Science
        focusing on networking, scripting, and web development.
      </p>
    </div>
    <div class="mt-8">
      <a href="/contact" class="btn btn-primary font-main">Contact</a>
    </div>
  </div>
</div>

<div class="text-neutral-content container mx-auto max-w-5xl p-8">
  <div class="card bg-base-300 p-8 text-center shadow-xl">
    <h2 class="font-title mb-4 text-3xl font-semibold">Experience & Skills</h2>
    <p class="font-main mb-6 text-lg">
      Here's a brief overview of my technical skills and professional experience.
    </p>
    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Programming</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>C++</li>
          <li>Python</li>
          <li>Perl</li>
          <li>Bash scripting</li>
          <li>JavaScript</li>
          <li>Elixir</li>
        </ul>
      </div>
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Web Development</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>Svelte / SvelteKit</li>
          <li>TailwindCSS</li>
        </ul>
      </div>
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Backend & Databases</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>Microsoft SQL</li>
        </ul>
      </div>
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Tools & Practices</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>Git</li>
          <li>Linux</li>
          <li>Agile Development</li>
          <li>AWS Cloud Computing</li>
          <li>Tmux</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<div class="text-neutral-content container mx-auto max-w-5xl p-8">
  <div class="card bg-base-300 p-8 text-center shadow-xl">
    <h2 class="font-title mb-4 text-3xl font-semibold">Featured Blog Post</h2>
    <p class="font-main mb-6 text-lg">Check out today's featured post from my blog!</p>

    {#if data.featuredPost}
      <div class="flex justify-center">
        <a
          href="/{data.featuredPost.slug}"
          class="card bg-neutral w-full max-w-md border-2 border-secondary text-left shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <figure>
            <img
              class="h-56 w-full object-cover opacity-75"
              src={data.featuredPost.image || '/previews/spencer-glacier.webp'}
              alt={data.featuredPost.title}
            />
          </figure>
          <div class="card-body">
            <h2 class="card-title font-title">{data.featuredPost.title}</h2>
            <p class="text-sm opacity-70">{formatDate(data.featuredPost.date)}</p>
            <p class="text-base-content/80 mt-2">{data.featuredPost.description}</p>
          </div>
        </a>
      </div>
    {:else}
      <p class="font-main text-base-content/60">No blog posts available yet.</p>
    {/if}

    <div class="mt-6">
      <a href="/blog" class="btn btn-secondary font-main">View All Posts</a>
    </div>
  </div>
</div>

<div class="text-neutral-content container mx-auto max-w-4xl p-8 pb-16">
  <div class="card bg-base-300 p-8 text-center shadow-xl">
    <h2 class="font-title mb-6 text-3xl font-semibold">Quick Links</h2>
    <div class="flex flex-col space-y-6">
      <div class="flex w-full flex-col items-center justify-between sm:flex-row sm:space-x-4">
        <p class="font-main mb-2 text-left text-lg sm:mb-0">
          If you want to see my projects and what I've been working on, click here:
        </p>
        <a href="/projects" class="btn btn-primary font-main w-full whitespace-nowrap sm:w-auto">
          View My Projects
        </a>
      </div>

      <div class="divider"></div>

      <div class="flex w-full flex-col items-center justify-between sm:flex-row sm:space-x-4">
        <p class="font-main mb-2 text-left text-lg sm:mb-0">
          If you would like to contact me or check out my socials, click here:
        </p>
        <a href="/contact" class="btn btn-success font-main w-full whitespace-nowrap sm:w-auto">
          Contact Me
        </a>
      </div>

      <div class="divider"></div>

      <div class="flex w-full flex-col items-center justify-between sm:flex-row sm:space-x-4">
        <p class="font-main mb-2 text-left text-lg sm:mb-0">
          For a full overview of my work and experience, you can download my resume:
        </p>
        <a
          href="/assets/jf_resume25-26.pdf"
          class="btn btn-accent font-main w-full whitespace-nowrap sm:w-auto"
        >
          Download CV
        </a>
      </div>

      <div class="divider"></div>

      <div class="flex w-full flex-col items-center justify-between sm:flex-row sm:space-x-4">
        <p class="font-main mb-2 text-left text-lg sm:mb-0">
          If you are interested in reading my blog and hearing my ideas, click here:
        </p>
        <a href="/blog" class="btn btn-secondary font-main w-full whitespace-nowrap sm:w-auto">
          Visit My Blog
        </a>
      </div>
    </div>
  </div>
</div>

<!--
<div class="container mx-auto max-w-5xl p-8 pb-16 text-neutral-content">
  <div class="card bg-base-300 p-8 shadow-xl text-center">
    <h2 class="font-title mb-4 text-3xl font-semibold">Featured Projects</h2>
    <p class="font-main mb-6 text-lg">
      Take a look at some of my featured projects!
    </p>
    <div class="flex justify-center space-x-5">
      <div class="card bg-base-100 w-96 shadow-sm">
        <figure>
          <img
            src="/previews/spencer-glacier.webp"
            alt="Project 1" />
        </figure>
        <div class="card-body">
          <h2 class="card-title">Card Title</h2>
          <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary">GitHub</button>
          </div>
        </div>
      </div>
      <div class="card bg-base-100 w-96 shadow-sm">
        <figure>
          <img
            src="/previews/spencer-glacier.webp"
            alt="Project 2" />
        </figure>
        <div class="card-body">
          <h2 class="card-title">Card Title</h2>
          <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary">GitHub</button>
          </div>
        </div>
      </div>
    </div>
    <p class="font-main mt-8">
      For more, please click the "See More" button!
    </p>
    <div class="mt-8">
      <a href="/projects" class="btn btn-primary font-main">See More...</a>
    </div>
  </div>
</div>
-->
