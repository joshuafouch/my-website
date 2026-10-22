<script lang="ts">
  import Metadata from '#lib/components/Metadata.svelte';

  const jobs = [
    {
      role: 'Student Researcher',
      when: 'Fall 2026 – Present',
      orgs: [
        {
          name: 'Franciscan University',
          href: 'https://snas.franciscan.edu/department-of-engineering-and-computing/'
        },
        { name: 'Air Force Research Laboratory', href: 'https://www.afrl.af.mil/' }
      ],
      body: 'Details coming soon.',
      skills: [] as string[]
    },
    {
      role: 'Automation Programming Intern',
      when: 'May 2026 – Present',
      orgs: [{ name: 'Alaska Railroad', href: 'https://www.alaskarailroad.com/' }],
      body: 'Architected a full-stack observability platform to continuously monitor 115+ remote industrial radios. Managed on-premise Linux VMs and built custom REST APIs for real-time network telemetry.',
      skills: ['Django REST Framework', 'Linux system automation', 'Scripting']
    },
    {
      role: 'ITS Helpdesk Technician',
      when: 'Aug 2025 – May 2026',
      orgs: [{ name: 'Dynamic Campus', href: 'https://dynamiccampus.com/' }],
      body: 'Provided Tier-1 IT support, diagnosing and resolving hardware, network connectivity, and OS-level software faults for a large university user base.',
      skills: ['Ticketing', 'Troubleshooting', 'Customer support']
    },
    {
      role: 'Computer Science Tutor',
      when: 'Fall 2024 – Spring 2025',
      orgs: [
        {
          name: 'Franciscan University',
          href: 'https://snas.franciscan.edu/department-of-engineering-and-computing/'
        }
      ],
      body: 'Mentored and graded students in computer science fundamentals, data structures, and programming concepts.',
      skills: ['C++', 'Grading', 'Mentoring']
    }
  ];

  const groups = [
    {
      title: 'Programming & scripting',
      items: ['C++', 'Python', 'JavaScript', 'Perl', 'Elixir', 'R', 'Bash']
    },
    {
      title: 'Networking & systems',
      items: ['AWS Cloud Design', 'Proxmox VE', 'Debian 13 Server', 'Tailscale', 'Nextcloud']
    },
    {
      title: 'Certifications',
      items: [
        {
          text: 'AWS Cloud Practitioner',
          href: 'https://www.credly.com/badges/7a3f3d96-94d2-4ea5-bc5a-9a0b0aac1ade/public_url'
        },
        'Working on CompTIA Network+'
      ]
    },
    {
      title: 'Web development',
      items: ['SvelteKit', 'Go with Gin', 'Python with Django', 'Tailwind CSS', 'REST API design']
    },
    {
      title: 'Databases',
      items: ['PostgreSQL', 'Microsoft SQL', 'SQL queries', 'CRUD operations']
    },
    {
      title: 'Tools & infrastructure',
      items: ['Git & GitHub', 'AWS', 'Tmux', 'Docker', 'Linux terminal']
    },
    {
      title: 'Operating systems',
      items: ['Debian 13', 'Ubuntu WSL', 'Windows 11', 'Arch Linux', 'Fedora Linux']
    },
    {
      title: 'Practices',
      items: ['Agile development', 'GitFlow', 'RESTful APIs', 'Client–server architecture']
    }
  ];
</script>

<Metadata
  title="Professional - Joshua Fouch"
  description="Work experience and the technologies Joshua Fouch uses, from the Alaska Railroad to Franciscan University."
  url="/about/professional"
  image="/assets/joshportraits/joshpfp1.jpg"
  imageAlt="Joshua Fouch"
/>

<header class="intro">
  <img src="/assets/joshportraits/joshpfp1.jpg" alt="Joshua Fouch" />
  <p>
    I am a fourth-year at Franciscan University of Steubenville studying Computer Science, focusing
    on networking, cybersecurity, and web development. I am currently working at the
    <a
      class="quiet-link"
      href="https://www.alaskarailroad.com/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Alaska Railroad
    </a>
    as an Automation Programming Intern.
  </p>
</header>

<section class="block">
  <h2>Work</h2>
  <p class="lede">Here is some of my professional work I am doing and have done.</p>

  <ol>
    {#each jobs as job (job.role)}
      <li>
        <div class="role">
          <h3>{job.role}</h3>
          <p class="when">{job.when}</p>
        </div>
        <p class="orgs">
          {#each job.orgs as org, index (org.href)}
            {#if index > 0}<span aria-hidden="true"> · </span>{/if}
            <a class="quiet-link" href={org.href} target="_blank" rel="noopener noreferrer"
              >{org.name}</a
            >
          {/each}
        </p>
        <p>{job.body}</p>
        {#if job.skills.length > 0}
          <p class="skills">{job.skills.join(' · ')}</p>
        {/if}
      </li>
    {/each}
  </ol>
</section>

<section class="block">
  <h2>Tech stack</h2>
  <p class="lede">An overview of the technologies I have used.</p>
  <div class="groups">
    {#each groups as group (group.title)}
      <div>
        <h3>{group.title}</h3>
        <ul>
          {#each group.items as item (typeof item === 'string' ? item : item.text)}
            <li>
              {#if typeof item === 'string'}
                {item}
              {:else}
                <a class="quiet-link" href={item.href} target="_blank" rel="noopener noreferrer"
                  >{item.text}</a
                >
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<style>
  .intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }

  img {
    width: 11rem;
    height: 11rem;
    border-radius: 9999px;
    object-fit: cover;
  }

  .intro p,
  .lede,
  li p {
    color: var(--ink-muted);
    font-size: 1.25rem;
    line-height: 1.55;
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
    margin: 2rem 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding: 1.5rem 0;
    border-top: 1px solid color-mix(in oklab, var(--nord4) 25%, transparent);
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
    gap: 2rem;
    margin-top: 2rem;
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
      flex-direction: row;
      align-items: center;
      text-align: left;
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
