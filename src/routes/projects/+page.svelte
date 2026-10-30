<script lang="ts">
  import { tick } from 'svelte';
  import Metadata from '#lib/components/Metadata.svelte';
  import ProjectPreview from '#lib/components/ProjectPreview.svelte';
  import { motion, reducedMotion } from '#lib/motion.svelte.ts';
  import type { Project } from '#lib/types.ts';

  let { data } = $props();

  let dialog: HTMLDialogElement | undefined = $state();
  let selected: Project | null = $state(null);
  let origin: DOMRect | null = null;
  let closing = false;

  function shift(box: DOMRect) {
    if (!origin) return null;
    return {
      x: origin.left + origin.width / 2 - (box.left + box.width / 2),
      y: origin.top + origin.height / 2 - (box.top + box.height / 2),
      sx: origin.width / box.width,
      sy: origin.height / box.height
    };
  }

  function playOpen() {
    if (!dialog || motion.off) return;
    if (reducedMotion() || !origin) {
      dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease' });
      return;
    }
    const move = shift(dialog.getBoundingClientRect());
    if (!move) return;
    dialog.animate(
      [
        {
          transform: `translate(${move.x}px, ${move.y}px) scale(${move.sx}, ${move.sy})`,
          opacity: 0.9
        },
        { transform: 'none', opacity: 1 }
      ],
      { duration: 400, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
    );
  }

  async function open(project: Project, event: MouseEvent) {
    origin = (event.currentTarget as HTMLElement).getBoundingClientRect();
    selected = project;
    await tick();
    dialog?.showModal();
    requestAnimationFrame(playOpen);
  }

  async function close() {
    if (!dialog?.open || closing) return;
    if (reducedMotion() || !origin) {
      dialog.close();
      return;
    }
    closing = true;
    const move = shift(dialog.getBoundingClientRect());
    if (move) {
      const animation = dialog.animate(
        [
          { transform: 'none', opacity: 1 },
          {
            transform: `translate(${move.x}px, ${move.y}px) scale(${move.sx}, ${move.sy})`,
            opacity: 0.45
          }
        ],
        { duration: 280, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
      );
      try {
        await animation.finished;
      } catch {
        /* A second close can cancel the animation. */
      }
    }
    closing = false;
    dialog.close();
  }

  function onDialogClose() {
    selected = null;
    origin = null;
  }

  function onDialogClick(event: MouseEvent) {
    if (event.target === dialog) close();
  }

  function onCancel(event: Event) {
    event.preventDefault();
    close();
  }
</script>

<Metadata
  title="My Projects"
  description="A collection of my professional, personal, and academic projects"
  url="/projects"
  image="/assets/backgrounds/IMG_1797.webp"
  imageAlt="Dog on a dock"
/>

<div class="projects font-serif">
  <header>
    <h1>Projects</h1>
    <p>Things I have built, and a closer look when you want one.</p>
  </header>

  {#if data.projects.length === 0}
    <p class="empty">Nothing here yet.</p>
  {:else}
    <ul>
      {#each data.projects as project (project.slug)}
        <li>
          <button type="button" class="project-card" onclick={(event) => open(project, event)}>
            <img src={project.image || '/assets/backgrounds/IMG_1797.webp'} alt="" />
            <span class="title">{project.title}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<dialog bind:this={dialog} onclick={onDialogClick} onclose={onDialogClose} oncancel={onCancel}>
  {#if selected}
    <button type="button" class="close" onclick={close}>Close</button>
    <ProjectPreview
      title={selected.title}
      description={selected.description}
      details={selected.details ?? ''}
      image={selected.image || '/assets/backgrounds/IMG_1797.webp'}
      images={selected.images ?? []}
      tags={selected.tags ?? []}
      sourceUrl={selected.sourceUrl ?? ''}
    />
  {/if}
</dialog>

<style>
  .projects {
    max-width: 46rem;
    margin-inline: auto;
    padding: 2.25rem 1.5rem 2.5rem;
    color: var(--ink);
  }

  header h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 500;
  }

  header p,
  .empty {
    color: var(--ink-muted);
  }

  header p {
    margin: 0.4rem 0 0;
    font-size: 1.3rem;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    margin: 2rem 0 0;
    padding: 0;
    list-style: none;
  }

  .project-card {
    position: relative;
    width: 16rem;
    height: 16rem;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--card-border);
    border-radius: 0.75rem;
    background: var(--surface-raised);
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .project-card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .title {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 2.75rem 1rem 0.9rem;
    background: linear-gradient(transparent, color-mix(in oklab, var(--ground) 92%, transparent));
    font-size: 1.45rem;
    font-weight: 500;
    line-height: 1.15;
  }

  .project-card:hover .title,
  .project-card:focus-visible .title {
    color: var(--ink-accent);
  }

  .project-card:focus-visible {
    outline: 1px solid var(--border-strong);
    outline-offset: 4px;
  }

  .empty {
    margin-top: 2rem;
    font-size: 1.25rem;
  }

  dialog {
    margin: auto;
    width: min(40rem, calc(100vw - 2rem));
    max-height: min(85svh, 48rem);
    overflow: auto;
    padding: 0;
    border: 1px solid var(--card-border);
    border-radius: 1rem;
    background: var(--dialog-bg);
    color: var(--ink);
    transform-origin: center;
  }

  dialog::backdrop {
    background: var(--dialog-backdrop);
  }

  .close {
    position: sticky;
    z-index: 1;
    top: 0.75rem;
    float: right;
    margin: 0.75rem 0.75rem -2.4rem 0;
    padding: 0.35rem 0.8rem;
    border: 1px solid var(--btn-border);
    background: var(--btn-bg);
    color: inherit;
    font: inherit;
    font-variant: small-caps;
    letter-spacing: 0.12em;
    cursor: pointer;
  }

  @media (max-width: 420px) {
    .project-card {
      width: 100%;
      height: auto;
      aspect-ratio: 1;
    }
  }
</style>
