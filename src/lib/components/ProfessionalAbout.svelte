<script lang="ts">
  import type { Job, Portrait, TechGroup } from '#lib/about.ts';
  import { safeHref } from '#lib/links.ts';

  let {
    introHtml = '',
    workIntro = '',
    techIntro = '',
    portraits = [],
    jobs = [],
    groups = []
  }: {
    introHtml?: string;
    workIntro?: string;
    techIntro?: string;
    portraits?: Portrait[];
    jobs?: Job[];
    groups?: TechGroup[];
  } = $props();

  function imageSrc(src: string): string | null {
    if (src.startsWith('blob:')) return src;
    return safeHref(src);
  }
</script>

<div class="about-copy">
  {#if portraits.length > 0 || introHtml}
    <header class="intro">
      {#if portraits.length > 0}
        <div class="portraits">
          {#each portraits as portrait (portrait.id)}
            {@const src = imageSrc(portrait.src)}
            {#if src}
              <img {src} alt={portrait.alt || 'Joshua Fouch'} />
            {/if}
          {/each}
        </div>
      {/if}
      {#if introHtml}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- admin-authored markdown -->
        <div class="copy">{@html introHtml}</div>
      {/if}
    </header>
  {/if}

  <section class="block">
    <h2>Work</h2>
    {#if workIntro}
      <p class="lede">{workIntro}</p>
    {/if}
    {#if jobs.length > 0}
      <ol>
        {#each jobs as job (job.id)}
          <li>
            <div class="role">
              <h3>{job.role}</h3>
              {#if job.timeSpan}
                <p class="when">{job.timeSpan}</p>
              {/if}
            </div>
            {#if job.orgs.length > 0}
              <p class="orgs">
                {#each job.orgs as org, index (org.name + org.href)}
                  {#if index > 0}<span aria-hidden="true"> · </span>{/if}
                  {@const href = safeHref(org.href)}
                  {#if href}
                    <a class="quiet-link" {href} target="_blank" rel="noopener noreferrer"
                      >{org.name}</a
                    >
                  {:else}
                    {org.name}
                  {/if}
                {/each}
              </p>
            {/if}
            {#if job.body}
              <p>{job.body}</p>
            {/if}
            {#if job.skills.length > 0}
              <p class="skills">{job.skills.join(' · ')}</p>
            {/if}
          </li>
        {/each}
      </ol>
    {/if}
  </section>

  <section class="block">
    <h2>Tech stack</h2>
    {#if techIntro}
      <p class="lede">{techIntro}</p>
    {/if}
    {#if groups.length > 0}
      <div class="groups">
        {#each groups as group (group.id)}
          <div>
            <h3>{group.title}</h3>
            <ul>
              {#each group.items as item (item.text + item.href)}
                {@const href = safeHref(item.href)}
                <li>
                  {#if href}
                    <a class="quiet-link" {href} target="_blank" rel="noopener noreferrer"
                      >{item.text}</a
                    >
                  {:else}
                    {item.text}
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .intro {
    display: grid;
    gap: 1.5rem;
    justify-items: center;
    text-align: center;
  }

  .portraits {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  img {
    width: 7.5rem;
    height: 7.5rem;
    border-radius: 9999px;
    object-fit: cover;
  }

  .portraits img:first-child {
    width: 11rem;
    height: 11rem;
  }

  .copy :global(p),
  .lede,
  li p {
    color: var(--ink-muted);
    font-size: 1.25rem;
    line-height: 1.55;
  }

  .copy :global(p) {
    margin: 0;
  }

  .block {
    margin-top: 4.5rem;
  }

  h2 {
    margin: 0 0 0.4rem;
    font-size: 2.4rem;
    font-weight: 500;
  }

  .lede {
    margin: 0;
  }

  ol {
    display: grid;
    gap: 0.85rem;
    margin: 1.5rem 0 0;
    padding: 0;
    list-style: none;
  }

  ol > li,
  .groups > div {
    padding: 1.15rem 1.25rem;
    border: 1px solid color-mix(in oklab, var(--nord4) 28%, transparent);
    background: color-mix(in oklab, var(--nord1) 72%, transparent);
  }

  .role {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  h3 {
    margin: 0;
    font-size: 1.55rem;
    font-weight: 500;
  }

  .when,
  .skills {
    margin: 0.35rem 0 0;
    font-size: 1.05rem;
    letter-spacing: 0.04em;
  }

  .orgs {
    margin: 0.35rem 0 0.6rem;
  }

  .groups {
    display: grid;
    gap: 0.85rem;
    margin-top: 1.5rem;
  }

  .groups ul {
    margin: 0.4rem 0 0;
    padding: 0;
    list-style: none;
    color: var(--ink-muted);
    font-size: 1.15rem;
    line-height: 1.6;
  }

  @media (min-width: 640px) {
    .intro {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      text-align: left;
    }

    .portraits {
      flex: 0 0 auto;
      justify-content: flex-start;
    }

    .copy {
      flex: 1;
    }

    .role {
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
    }

    .groups {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
