<script lang="ts">
  import { tick } from 'svelte';
  import Metadata from '#lib/components/Metadata.svelte';
  import ProjectPreview from '#lib/components/ProjectPreview.svelte';
  import { motion, reducedMotion } from '#lib/motion.svelte.ts';
  import type { Project } from '#lib/types.ts';

  let { data } = $props();

  let dialog: HTMLDialogElement | undefined = $state();
  let selected: Project | null = $state(null);
  let closing = false;

  const ease = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

  function clearAnims(el: Element) {
    for (const animation of el.getAnimations()) animation.cancel();
  }

  function resetSurface() {
    if (!dialog) return;
    clearAnims(dialog);
    dialog.style.opacity = '';
  }

  function animateBackdrop(from: number, to: number, duration: number) {
    if (!dialog) return;
    dialog.animate([{ opacity: from }, { opacity: to }], {
      duration,
      easing: ease,
      pseudoElement: '::backdrop'
    });
  }

  async function waitAnim(animation: Animation, fallbackMs: number) {
    try {
      await Promise.race([
        animation.finished,
        new Promise<void>((resolve) => setTimeout(resolve, fallbackMs))
      ]);
    } catch {
      /* Cancelled by a newer open/close. */
    }
  }

  function playOpen() {
    if (!dialog || motion.off) return;
    resetSurface();
    const duration = reducedMotion() ? 140 : 240;
    dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: ease });
    animateBackdrop(0, 1, duration);
  }

  async function open(project: Project) {
    if (closing) {
      closing = false;
      resetSurface();
      dialog?.close();
    }
    selected = project;
    await tick();
    if (!dialog) return;
    if (dialog.open) resetSurface();
    else dialog.showModal();
    requestAnimationFrame(playOpen);
  }

  async function close() {
    if (!dialog?.open || closing) return;

    if (motion.off || reducedMotion()) {
      resetSurface();
      dialog.close();
      return;
    }

    closing = true;
    clearAnims(dialog);
    const animation = dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 180,
      easing: ease
    });
    animateBackdrop(1, 0, 180);
    await waitAnim(animation, 240);
    closing = false;
    resetSurface();
    if (dialog.open) dialog.close();
  }

  function onDialogClose() {
    selected = null;
    closing = false;
    resetSurface();
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
          <button type="button" class="project-card" onclick={() => open(project)}>
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
    transition:
      border-color 220ms var(--ease-out),
      transform 220ms var(--ease-out);
  }

  .project-card:hover,
  .project-card:focus-visible {
    border-color: var(--border-strong);
    transform: translateY(-2px);
  }

  .project-card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 480ms var(--ease-out);
  }

  .project-card:hover img,
  .project-card:focus-visible img {
    transform: scale(1.03);
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
    transition: color 180ms ease;
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
    box-shadow: 0 18px 48px color-mix(in oklab, var(--nord0) 28%, transparent);
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

  @media (prefers-reduced-motion: reduce) {
    .project-card,
    .project-card img,
    .title {
      transition: none;
    }

    .project-card:hover,
    .project-card:focus-visible,
    .project-card:hover img,
    .project-card:focus-visible img {
      transform: none;
    }
  }
</style>
