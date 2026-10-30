-- Backgrounds moved under /assets/backgrounds; use the dog photo as the default cover.
update public.projects
set image = '/assets/backgrounds/IMG_1797.webp'
where image in (
  '/assets/hero-bg.webp',
  '/assets/backgrounds/hero-bg.webp',
  '/assets/happy_snow.webp',
  '/assets/valleybutte.webp',
  '/assets/thunderbirdfalls.webp'
)
or image is null
or image = '';
