<script lang="ts">
  import { formatDate } from '$lib/utils';
  import Metadata from '$lib/components/Metadata.svelte';
  import { resolve } from '$app/paths';
  let { data } = $props();
</script>

<Metadata
  title="Joshua Fouch - Computer Science Student & Developer"
  description="Fourth-year Computer Science undergraduate at Franciscan University, focusing on networking, scripting, and web development. Explore my portfolio, projects, and blog."
  url="/"
  image="/assets/hero-bg.webp"
  imageAlt="Joshua Fouch's Portfolio"
/>

<div
  class="hero relative min-h-screen rounded-b-4xl bg-cover bg-bottom sm:bg-fixed sm:bg-center"
  style="background-image: url('/assets/hero-bg.webp');"
>
  <div class="hero-overlay bg-neutral/80 rounded-b-4xl"></div>
  <div class="hero-content text-neutral-content text-center">
    <div class="max-w-md">
      <img class="img pb-2" src="/assets/JF_logo_light.webp" alt="signature" />
      <p class="font-title mb-2 text-xl">
        Hello! My name is <span class="text-accent font-semibold italic">Joshua Fouch</span>.
        Welcome to my corner of the web.
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
          <img src="/assets/joshportraits/joshpfp1.jpg" alt="Joshua F." />
        </div>
      </div>
      <p class="font-main grow text-lg sm:text-left">
        I am a fourth-year at Franciscan University of Steubenville studying Computer Science
        focusing on networking, cybersecurity, and web development. I am currently working at the
        <span class="text-accent">Alaska Railroad</span> as a
        <span class="text-accent">Automation Programming Intern</span>.
      </p>
    </div>
    <div class="mt-8">
      <a href={resolve('/contact')} class="btn btn-primary font-main">Contact</a>
    </div>
  </div>
</div>

<div id="experience" class="text-neutral-content container mx-auto max-w-5xl p-8">
  <div class="card bg-base-300 p-8 shadow-xl">
    <div class="mb-8 text-center">
      <h2 class="font-title mb-2 text-3xl font-semibold">Technical Work Experience</h2>
      <p class="font-main text-lg">
        Here is some of my professional work I am doing and have done.
      </p>
    </div>

    <div class="space-y-6">
      <!-- Automation Programming Intern -->
      <div
        class="card bg-base-100 border-accent border-l-4 shadow-md transition-all duration-300 hover:shadow-lg"
      >
        <div class="card-body p-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 class="font-title text-xl font-semibold">Automation Programming Intern</h3>
            <span class="badge badge-outline text-sm">May 2026 - Present</span>
          </div>
          <p class="font-main text-accent mt-1 font-medium">
            <a href="https://www.alaskarailroad.com/" class="link" target="_blank">
              Alaska Railroad
            </a>
          </p>
          <p class="font-main text-base-content/80 mt-3">Details coming soon...</p>
          <div class="card-actions mt-4 flex-wrap justify-start gap-2">
            <span class="badge badge-accent">Python</span>
            <span class="badge badge-accent">System Automation</span>
            <span class="badge badge-accent">Scripting</span>
          </div>
        </div>
      </div>

      <!-- Computer Science Tutor -->
      <div
        class="card bg-base-100 border-info border-l-4 shadow-md transition-all duration-300 hover:shadow-lg"
      >
        <div class="card-body p-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 class="font-title text-xl font-semibold">ITS Helpdesk Technician</h3>
            <span class="badge badge-outline text-sm">Aug 2025 - May 2026</span>
          </div>
          <p class="font-main text-info mt-1 font-medium">
            <a href="https://dynamiccampus.com/" target="_blank" class="link"> Dynamic Campus </a>
          </p>
          <p class="font-main text-base-content/80 mt-3">
            Worked as an IT helpdesk technician, providing technical support and troubleshooting for
            campus computers and networks.
          </p>
          <div class="card-actions mt-4 flex-wrap justify-start gap-2">
            <span class="badge badge-info">Ticketing</span>
            <span class="badge badge-info">Troubleshooting</span>
            <span class="badge badge-info">Customer Support</span>
          </div>
        </div>
      </div>

      <!-- Computer Science Tutor -->
      <div
        class="card bg-base-100 border-success border-l-4 shadow-md transition-all duration-300 hover:shadow-lg"
      >
        <div class="card-body p-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 class="font-title text-xl font-semibold">Computer Science Tutor</h3>
            <span class="badge badge-outline text-sm">Fall 2024 - Spring 2025</span>
          </div>
          <p class="font-main text-success mt-1 font-medium">
            <a
              href="https://snas.franciscan.edu/department-of-engineering-and-computing/"
              target="_blank"
              class="link"
            >
              Franciscan University
            </a>
          </p>
          <p class="font-main text-base-content/80 mt-3">
            Mentored and graded students in computer science fundamentals, data structures, and
            programming concepts. Helped develop problem-solving skills and debugging techniques.
          </p>
          <div class="card-actions mt-4 flex-wrap justify-start gap-2">
            <span class="badge badge-success">C++</span>
            <span class="badge badge-success">Grading</span>
            <span class="badge badge-success">Mentoring</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="text-neutral-content container mx-auto max-w-5xl p-8">
  <div class="card bg-base-300 p-8 text-center shadow-xl">
    <h2 class="font-title mb-4 text-3xl font-semibold">Tech Stack</h2>
    <p class="font-main mb-6 text-lg">Here's an overview of the technologies I have used.</p>
    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Programming & Scripting</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>C++</li>
          <li>Python Scripting</li>
          <li>JavaScript</li>
          <li>Perl Scripting</li>
          <li>Elixir</li>
          <li>R Data Analysis</li>
          <li>Bash Scripting</li>
        </ul>
      </div>
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Networking & System Administration</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>AWS Cloud Design</li>
          <li>Proxmox VE</li>
          <li>Debian 13 Server</li>
          <li>Tailscale</li>
          <li>Nextcloud</li>
        </ul>
      </div>
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Certifications</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>
            <a
              href="https://www.credly.com/badges/7a3f3d96-94d2-4ea5-bc5a-9a0b0aac1ade/public_url"
              target="_blank"
              class="link text-accent">AWS Cloud Practitioner</a
            >
          </li>
          <li class="italic">Working on Comptia Network+</li>
        </ul>
      </div>
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Web Development</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>SvelteKit</li>
          <li>Go with Gin</li>
          <li>Python with Django</li>
          <li>TailwindCSS</li>
          <li>REST APIs Design</li>
        </ul>
      </div>

      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Databases</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>PostgreSQL</li>
          <li>Microsoft SQL</li>
          <li>SQL Queries</li>
          <li>CRUD Operations</li>
        </ul>
      </div>
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Tools & Infrastructure</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>Git & GitHub</li>
          <li>AWS Cloud Computing</li>
          <li>Tmux</li>
          <li>Docker</li>
          <li>Linux Terminal</li>
        </ul>
      </div>
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Operating Systems</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>Debian 13</li>
          <li>Ubuntu WSL</li>
          <li>Windows 11</li>
          <li>Arch Linux</li>
          <li>Fedora Linux</li>
        </ul>
      </div>
      <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Concepts & Practices</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>Agile Development</li>
          <li>GitFlow</li>
          <li>RESTful APIs</li>
          <li>Client Server Architecture</li>
        </ul>
      </div>
      <!-- <div class="card bg-base-100 p-6 shadow-md transition-shadow hover:shadow-lg">
        <h3 class="font-title mb-2 text-xl font-medium">Artificial Intelligence</h3>
        <ul class="font-main list-disc pl-5 text-left">
          <li>OpenCode</li>
          <li>OpenRouter</li>
        </ul>
      </div> -->
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
          href={resolve(`/${data.featuredPost.slug}`)}
          class="card bg-neutral border-secondary w-full max-w-md border-2 text-left shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
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
      <a href={resolve('/blog')} class="btn btn-secondary font-main">View All Posts</a>
    </div>
  </div>
</div>

<!-- <div class="text-neutral-content container mx-auto max-w-5xl p-8 pb-16">
  <div class="card bg-base-300 p-8 text-center shadow-xl">
    <h2 class="font-title mb-4 text-3xl font-semibold">Featured Projects</h2>
    <p class="font-main mb-6 text-lg">Take a look at some of my featured projects!</p>
    <div class="flex justify-center space-x-5">
      <div class="card bg-base-100 w-96 shadow-sm">
        <figure>
          <img src="/previews/spencer-glacier.webp" alt="Project 1" />
        </figure>
        <div class="card-body">
          <h2 class="card-title">Card Title</h2>
          <p>
            A card component has a figure, a body part, and inside body there are title and actions
            parts
          </p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary">GitHub</button>
          </div>
        </div>
      </div>
      <div class="card bg-base-100 w-96 shadow-sm">
        <figure>
          <img src="/previews/spencer-glacier.webp" alt="Project 2" />
        </figure>
        <div class="card-body">
          <h2 class="card-title">Card Title</h2>
          <p>
            A card component has a figure, a body part, and inside body there are title and actions
            parts
          </p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary">GitHub</button>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-8">
      <a href={resolve('/projects')} class="btn btn-primary font-main">See More...</a>
    </div>
  </div>
</div> -->

<div class="text-neutral-content container mx-auto max-w-4xl p-8 pb-16">
  <div class="card bg-base-300 p-8 text-center shadow-xl">
    <h2 class="font-title mb-6 text-3xl font-semibold">Quick Links</h2>
    <div class="flex flex-col space-y-6">
      <!-- <div class="flex w-full flex-col items-center justify-between sm:flex-row sm:space-x-4">
        <p class="font-main mb-2 text-left text-lg sm:mb-0">
          If you want to see my projects and what I've been working on, click here:
        </p>
        <a
          href={resolve('/projects')}
          class="btn btn-primary font-main w-full whitespace-nowrap sm:w-auto"
        >
          View My Projects
        </a>
      </div>

      <div class="divider"></div> -->

      <div class="flex w-full flex-col items-center justify-between sm:flex-row sm:space-x-4">
        <p class="font-main mb-2 text-left text-lg sm:mb-0">
          If you would like to contact me or check out my socials, click here:
        </p>
        <a
          href={resolve('/contact')}
          class="btn btn-success font-main w-full whitespace-nowrap sm:w-auto"
        >
          Contact Me
        </a>
      </div>

      <div class="divider"></div>

      <div class="flex w-full flex-col items-center justify-between sm:flex-row sm:space-x-4">
        <p class="font-main mb-2 text-left text-lg sm:mb-0">
          For a full overview of my work and experience, you can download my resume:
        </p>
        <a
          href="/assets/jf_resume26-27.pdf"
          class="btn btn-accent font-main w-full whitespace-nowrap sm:w-auto"
        >
          Download Resume
        </a>
      </div>

      <div class="divider"></div>

      <div class="flex w-full flex-col items-center justify-between sm:flex-row sm:space-x-4">
        <p class="font-main mb-2 text-left text-lg sm:mb-0">
          If you are interested in reading my blog and hearing my ideas, click here:
        </p>
        <a
          href={resolve('/blog')}
          class="btn btn-secondary font-main w-full whitespace-nowrap sm:w-auto"
        >
          Visit My Blog
        </a>
      </div>
    </div>
  </div>
</div>
