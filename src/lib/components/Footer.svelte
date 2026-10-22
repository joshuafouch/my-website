<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<footer class="site-footer font-serif">
  <p>
    &copy; {new Date().getFullYear()} Joshua Fouch
    <br />
    <em>Omnia ad Jesum per Mariam!</em>
  </p>
  <ul>
    <li>
      <a class="quiet-link" href={resolve('/resume')}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 2h8.2L20 7.8V22H6V2z" />
        </svg>
        Resume
      </a>
    </li>
    <li>
      <a
        class="quiet-link"
        href="https://github.com/joshuafouch"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.022c-3.338.724-4.033-1.61-4.033-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.527.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.403c1.018.005 2.044.138 3.003.403 2.291-1.552 3.297-1.23 3.297-1.23.655 1.649.243 2.873.12 3.176.77.84 1.236 1.911 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.43.37.815 1.102.815 2.222v3.293c0 .321.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
        GitHub
      </a>
    </li>
    <li>
      <a
        class="quiet-link"
        href="https://www.linkedin.com/in/joshua-fouch12"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.762 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.867-3.063-1.867 0-2.154 1.459-2.154 2.969v5.698h-3v-10h2.881v1.367h.041c.401-.762 1.381-1.564 2.841-1.564 3.037 0 3.599 2.028 3.599 4.675v5.522z"
          />
        </svg>
        LinkedIn
      </a>
    </li>
  </ul>
</footer>

<style>
  .site-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 1.5rem;
    margin-top: 4rem;
    padding: 2.5rem 1.5rem 2rem;
    border-top: 1px solid color-mix(in oklab, var(--nord4) 22%, transparent);
    color: var(--ink-muted);
  }

  p {
    margin: 0;
    line-height: 1.5;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
    font-variant: small-caps;
    letter-spacing: 0.12em;
    font-size: 1.05rem;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2.75rem;
  }

  svg {
    width: 0.95rem;
    height: 0.95rem;
    fill: currentColor;
  }
</style>
