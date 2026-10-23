-- About page content, separate from posts and projects.
-- Public can read. The admin email can write at any authenticator level, including aal1.

create table public.about_professional (
  id smallint primary key default 1,
  intro text not null default '',
  work_intro text not null default '',
  tech_intro text not null default '',
  updated_at timestamptz not null default now(),
  constraint about_professional_singleton check (id = 1)
);

create table public.portraits (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  constraint portraits_src_not_blank check (length(btrim(src)) > 0)
);

create table public.work_experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  time_span text not null default '',
  body text not null default '',
  skills text[] not null default '{}',
  orgs jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  constraint work_experiences_role_not_blank check (length(btrim(role)) > 0),
  constraint work_experiences_orgs_array check (jsonb_typeof(orgs) = 'array')
);

create table public.tech_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  items jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  constraint tech_groups_title_not_blank check (length(btrim(title)) > 0),
  constraint tech_groups_items_array check (jsonb_typeof(items) = 'array')
);

create table public.about_personal (
  id smallint primary key default 1,
  intro text not null default '',
  youtube_url text,
  updated_at timestamptz not null default now(),
  constraint about_personal_singleton check (id = 1)
);

create table public.music_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null default '',
  note text not null default '',
  url text,
  sort_order integer not null default 0,
  constraint music_entries_title_not_blank check (length(btrim(title)) > 0)
);

do $$
declare
  t text;
  tables text[] := array[
    'about_professional',
    'portraits',
    'work_experiences',
    'tech_groups',
    'about_personal',
    'music_entries'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant select on table public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on table public.%I to authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
    execute format('create policy %I on public.%I for select using (true)', 'Public read', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (((select auth.jwt()) ->> %L) = %L)',
      'Author insert',
      t,
      'email',
      'joshie.fouchie@gmail.com'
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (((select auth.jwt()) ->> %L) = %L) with check (((select auth.jwt()) ->> %L) = %L)',
      'Author update',
      t,
      'email',
      'joshie.fouchie@gmail.com',
      'email',
      'joshie.fouchie@gmail.com'
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (((select auth.jwt()) ->> %L) = %L)',
      'Author delete',
      t,
      'email',
      'joshie.fouchie@gmail.com'
    );
  end loop;
end
$$;

insert into public.about_professional (id, intro, work_intro, tech_intro)
values (
  1,
  $intro$I am a fourth-year at Franciscan University of Steubenville studying Computer Science, focusing on networking, cybersecurity, and web development. I am currently working at the [Alaska Railroad](https://www.alaskarailroad.com/) as an Automation Programming Intern.$intro$,
  'Here is some of my professional work I am doing and have done.',
  'An overview of the technologies I have used.'
);

insert into public.portraits (src, alt, sort_order)
values ('/assets/joshportraits/joshpfp1.jpg', 'Joshua Fouch', 0);

insert into public.work_experiences (role, time_span, body, skills, orgs, sort_order)
values
  (
    'Student Researcher',
    'Fall 2026 – Present',
    'Details coming soon.',
    '{}'::text[],
    jsonb_build_array(
      jsonb_build_object('name', 'Franciscan University', 'href', 'https://snas.franciscan.edu/department-of-engineering-and-computing/'),
      jsonb_build_object('name', 'Air Force Research Laboratory', 'href', 'https://www.afrl.af.mil/')
    ),
    0
  ),
  (
    'Automation Programming Intern',
    'May 2026 – Present',
    'Architected a full-stack observability platform to continuously monitor 115+ remote industrial radios. Managed on-premise Linux VMs and built custom REST APIs for real-time network telemetry.',
    array['Django REST Framework', 'Linux system automation', 'Scripting']::text[],
    jsonb_build_array(
      jsonb_build_object('name', 'Alaska Railroad', 'href', 'https://www.alaskarailroad.com/')
    ),
    1
  ),
  (
    'ITS Helpdesk Technician',
    'Aug 2025 – May 2026',
    'Provided Tier-1 IT support, diagnosing and resolving hardware, network connectivity, and OS-level software faults for a large university user base.',
    array['Ticketing', 'Troubleshooting', 'Customer support']::text[],
    jsonb_build_array(
      jsonb_build_object('name', 'Dynamic Campus', 'href', 'https://dynamiccampus.com/')
    ),
    2
  ),
  (
    'Computer Science Tutor',
    'Fall 2024 – Spring 2025',
    'Mentored and graded students in computer science fundamentals, data structures, and programming concepts.',
    array['C++', 'Grading', 'Mentoring']::text[],
    jsonb_build_array(
      jsonb_build_object('name', 'Franciscan University', 'href', 'https://snas.franciscan.edu/department-of-engineering-and-computing/')
    ),
    3
  );

insert into public.tech_groups (title, items, sort_order)
values
  (
    'Programming & scripting',
    jsonb_build_array(
      jsonb_build_object('text', 'C++'),
      jsonb_build_object('text', 'Python'),
      jsonb_build_object('text', 'JavaScript'),
      jsonb_build_object('text', 'Perl'),
      jsonb_build_object('text', 'Elixir'),
      jsonb_build_object('text', 'R'),
      jsonb_build_object('text', 'Bash')
    ),
    0
  ),
  (
    'Networking & systems',
    jsonb_build_array(
      jsonb_build_object('text', 'AWS Cloud Design'),
      jsonb_build_object('text', 'Proxmox VE'),
      jsonb_build_object('text', 'Debian 13 Server'),
      jsonb_build_object('text', 'Tailscale'),
      jsonb_build_object('text', 'Nextcloud')
    ),
    1
  ),
  (
    'Certifications',
    jsonb_build_array(
      jsonb_build_object('text', 'AWS Cloud Practitioner', 'href', 'https://www.credly.com/badges/7a3f3d96-94d2-4ea5-bc5a-9a0b0aac1ade/public_url'),
      jsonb_build_object('text', 'Working on CompTIA Network+')
    ),
    2
  ),
  (
    'Web development',
    jsonb_build_array(
      jsonb_build_object('text', 'SvelteKit'),
      jsonb_build_object('text', 'Go with Gin'),
      jsonb_build_object('text', 'Python with Django'),
      jsonb_build_object('text', 'Tailwind CSS'),
      jsonb_build_object('text', 'REST API design')
    ),
    3
  ),
  (
    'Databases',
    jsonb_build_array(
      jsonb_build_object('text', 'PostgreSQL'),
      jsonb_build_object('text', 'Microsoft SQL'),
      jsonb_build_object('text', 'SQL queries'),
      jsonb_build_object('text', 'CRUD operations')
    ),
    4
  ),
  (
    'Tools & infrastructure',
    jsonb_build_array(
      jsonb_build_object('text', 'Git & GitHub'),
      jsonb_build_object('text', 'AWS'),
      jsonb_build_object('text', 'Tmux'),
      jsonb_build_object('text', 'Docker'),
      jsonb_build_object('text', 'Linux terminal')
    ),
    5
  ),
  (
    'Operating systems',
    jsonb_build_array(
      jsonb_build_object('text', 'Debian 13'),
      jsonb_build_object('text', 'Ubuntu WSL'),
      jsonb_build_object('text', 'Windows 11'),
      jsonb_build_object('text', 'Arch Linux'),
      jsonb_build_object('text', 'Fedora Linux')
    ),
    6
  ),
  (
    'Practices',
    jsonb_build_array(
      jsonb_build_object('text', 'Agile development'),
      jsonb_build_object('text', 'GitFlow'),
      jsonb_build_object('text', 'RESTful APIs'),
      jsonb_build_object('text', 'Client–server architecture')
    ),
    7
  );

insert into public.about_personal (id, intro)
values (1, '');
