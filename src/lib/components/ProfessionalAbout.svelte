<script lang="ts">
  import type { Job, Portrait, TechGroup } from '#lib/about.ts';
  import AboutIntro from '#lib/components/AboutIntro.svelte';
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
</script>

<div class="about-copy">
  <AboutIntro {introHtml} {portraits} side="start" label="Professional portraits" />

  {#if workIntro || jobs.length > 0}
    <section class="rise block" style:--i={3}>
      <h2>Work</h2>
      {#if workIntro}
        <p class="lede">{workIntro}</p>
      {/if}
      {#if jobs.length > 0}
        <!-- A ledger: the dates in the margin, the role beside them. -->
        <ol class="jobs">
          {#each jobs as job (job.id)}
            <li>
              <p class="when font-mono">{job.timeSpan}</p>
              <div>
                <h3>{job.role}</h3>
                {#if job.orgs.length > 0}
                  <p class="orgs">
                    {#each job.orgs as org, index (org.name + org.href)}
                      {#if index > 0}<span aria-hidden="true"> · </span>{/if}
                      {@const href = safeHref(org.href)}
                      {#if href}
                        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external URL -->
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
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by renderMarkdown -->
                  <div class="job-body">{@html job.body}</div>
                {/if}
                {#if job.skills.length > 0}
                  <p class="skills">{job.skills.join(' · ')}</p>
                {/if}
              </div>
            </li>
          {/each}
        </ol>
      {/if}
    </section>
  {/if}

  {#if techIntro || groups.length > 0}
    <section class="rise block" style:--i={4}>
      <h2>Tech stack</h2>
      {#if techIntro}
        <p class="lede">{techIntro}</p>
      {/if}
      {#if groups.length > 0}
        <dl class="groups">
          {#each groups as group (group.id)}
            <div class="tool-row">
              <dt class="font-mono">{group.title}</dt>
              <dd>
                <ul>
                  {#each group.items as item (item.text + item.href)}
                    {@const href = safeHref(item.href)}
                    <li>
                      {#if href}
                        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external URL -->
                        <a class="tool-link" {href} target="_blank" rel="noopener noreferrer"
                          >{item.text}</a
                        >
                      {:else}
                        {item.text}
                      {/if}
                    </li>
                  {/each}
                </ul>
              </dd>
            </div>
          {/each}
        </dl>
      {/if}
    </section>
  {/if}
</div>

<style>
  .block {
    margin-top: 4.5rem;
  }

  h2 {
    margin: 0;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--border-strong);
    font-size: 2.4rem;
    font-weight: 500;
  }

  .lede,
  .job-body :global(p) {
    color: var(--ink-muted);
    font-size: 1.2rem;
    line-height: 1.55;
  }

  .lede {
    margin: 0.9rem 0 0;
  }

  .jobs {
    margin: 0.75rem 0 0;
    padding: 0;
    list-style: none;
  }

  .jobs > li {
    display: grid;
    gap: 0.35rem;
    padding: 1.5rem 0;
    border-bottom: 1px solid var(--border-subtle);
  }

  .when {
    margin: 0;
    color: var(--ink-faint);
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    text-transform: lowercase;
  }

  h3 {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 500;
    line-height: 1.15;
  }

  .orgs {
    margin: 0.3rem 0 0;
    font-size: 1.15rem;
    font-style: italic;
  }

  .orgs a {
    color: var(--ink-accent);
  }

  .job-body {
    margin-top: 0.6rem;
  }

  .job-body :global(p) {
    margin: 0;
  }

  .job-body :global(p + p) {
    margin-top: 0.75rem;
  }

  .job-body :global(a) {
    color: var(--ink-accent);
  }

  .skills {
    margin: 0.6rem 0 0;
    color: var(--ink-muted);
    font-size: 1.03rem;
    font-variant: small-caps;
    letter-spacing: 0.12em;
  }

  .groups {
    margin: 0.75rem 0 0;
  }

  .tool-row {
    display: grid;
    gap: 0.35rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-subtle);
  }

  dt {
    color: var(--ink-faint);
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    text-transform: lowercase;
  }

  dd {
    margin: 0;
  }

  .groups ul {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 1.2rem;
    line-height: 1.5;
  }

  .groups li + li::before {
    content: '·';
    padding-inline: 0.5rem;
    color: var(--ink-faint);
  }

  .tool-link {
    color: var(--ink-accent);
    text-decoration: none;
    background: linear-gradient(currentColor, currentColor) no-repeat left bottom / 100% 1px;
    padding-bottom: 1px;
  }

  .tool-link:hover,
  .tool-link:focus-visible {
    color: var(--ink);
    outline: none;
  }

  @media (min-width: 640px) {
    .jobs > li,
    .tool-row {
      grid-template-columns: 10.5rem minmax(0, 1fr);
      gap: 2rem;
    }

    .when {
      padding-top: 0.55rem;
    }

    dt {
      padding-top: 0.3rem;
    }
  }
</style>
