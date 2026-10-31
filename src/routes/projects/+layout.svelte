<script lang="ts">
  import { tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import ProjectPreview from '#lib/components/ProjectPreview.svelte';
  import { motion, reducedMotion } from '#lib/motion.svelte.ts';
  import type { Project } from '#lib/types.ts';

  let { data, children } = $props();

  let dialog: HTMLDialogElement | undefined = $state();
  /** Project shown inside the dialog — kept through the close fade so content doesn’t vanish early. */
  let display: Project | null = $state(null);
  let closing = false;
  let lastOpenedSlug: string | null = null;

  const ease = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
  const slug = $derived(page.params.slug as string | undefined);
  const selected = $derived(
    slug ? (data.projects.find((project) => project.slug === slug) ?? null) : null
  );

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
      fill: from > to ? 'forwards' : 'none',
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
    if (!dialog) return;
    if (motion.off) {
      dialog.style.opacity = '';
      return;
    }
    clearAnims(dialog);
    const duration = reducedMotion() ? 140 : 240;
    const animation = dialog.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration,
      easing: ease,
      fill: 'forwards'
    });
    animation.finished
      .then(() => {
        if (!dialog) return;
        dialog.style.opacity = '';
        clearAnims(dialog);
      })
      .catch(() => {});
    // Solid backdrop immediately — page chrome must not show through the fade.
    dialog.animate([{ opacity: 1 }, { opacity: 1 }], {
      duration: 1,
      fill: 'forwards',
      pseudoElement: '::backdrop'
    });
  }

  async function openFor(project: Project) {
    display = project;
    await tick();
    if (!dialog || closing) return;

    const same = lastOpenedSlug === project.slug && dialog.open;
    if (same) return;

    lastOpenedSlug = project.slug;
    // Invisible on first paint, then fade in — avoids a full-opacity flash.
    if (!motion.off && !reducedMotion()) dialog.style.opacity = '0';
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(playOpen);
  }

  $effect(() => {
    if (closing) return;
    if (selected) {
      void openFor(selected);
      return;
    }
    // URL cleared elsewhere — shut the dialog without a reopen flash.
    lastOpenedSlug = null;
    display = null;
    if (dialog?.open) {
      resetSurface();
      dialog.close();
    }
  });

  async function close() {
    if (closing || (!dialog?.open && !slug && !display)) return;
    closing = true;

    if (dialog?.open && !motion.off && !reducedMotion()) {
      clearAnims(dialog);
      const animation = dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 180,
        easing: ease,
        fill: 'forwards'
      });
      animateBackdrop(1, 0, 180);
      await waitAnim(animation, 240);
    }

    // Close while still faded out — do not reset opacity first (that was the flash).
    if (dialog?.open) dialog.close();
    resetSurface();
    display = null;
    lastOpenedSlug = null;

    if (page.params.slug) {
      await goto(resolve('/projects'), { replace: true, reset: false });
    }
    closing = false;
  }

  function onDialogClose() {
    // `close()` owns teardown and navigation.
    if (closing) return;
    display = null;
    lastOpenedSlug = null;
    resetSurface();
    if (page.params.slug) {
      void goto(resolve('/projects'), { replace: true, reset: false });
    }
  }

  function onDialogClick(event: MouseEvent) {
    if (event.target === dialog) close();
  }

  function onCancel(event: Event) {
    event.preventDefault();
    close();
  }

  /** Open the dialog before the route paint so the grid card never flashes underneath. */
  function onCardClick(event: MouseEvent, project: Project) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (closing) return;
    display = project; // hide twin in the grid this frame
    void openFor(project);
    if (slug !== project.slug) {
      void goto(resolve('/projects/[slug]', { slug: project.slug }), { reset: false });
    }
  }
</script>

{@render children()}

<div class="projects font-serif" class:covered={!!display}>
  <header>
    <h1>Projects</h1>
    <p>Personal, research, and collaborative projects.</p>
  </header>

  {#if data.projects.length === 0}
    <p class="empty">Nothing here yet.</p>
  {:else}
    <ul>
      {#each data.projects as project (project.slug)}
        <li>
          <a
            class="project-card"
            class:is-open={display?.slug === project.slug}
            href={resolve('/projects/[slug]', { slug: project.slug })}
            aria-current={slug === project.slug ? 'page' : undefined}
            data-sveltekit-reset="false"
            onclick={(event) => onCardClick(event, project)}
          >
            <img src={project.image || '/assets/backgrounds/IMG_1797.webp'} alt="" />
            <span class="title">{project.title}</span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<dialog bind:this={dialog} onclick={onDialogClick} onclose={onDialogClose} oncancel={onCancel}>
  {#if display}
    <button type="button" class="close" onclick={close}>Close</button>
    <ProjectPreview
      title={display.title}
      description={display.description}
      details={display.details ?? ''}
      image={display.image || '/assets/backgrounds/IMG_1797.webp'}
      images={display.images ?? []}
      tags={display.tags ?? []}
      sourceUrl={display.sourceUrl ?? ''}
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

  /* Hide title, blurb, and grid while a card is open so nothing flashes underneath. */
  .projects.covered {
    visibility: hidden;
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
    display: block;
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
    text-decoration: none;
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

  /* Hide the twin in the grid while its dialog is up. */
  .project-card.is-open {
    visibility: hidden;
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
    /* No top margin — that was leaving a strip of dialog above the hero. */
    margin: 0 0.75rem -2.4rem 0;
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
