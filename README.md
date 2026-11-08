# my-website

Built with SvelteKit, Tailwind, and Supabase. Hosted on Vercel.

## Setup

```sh
pnpm install
cp .env.example .env   # fill in the Supabase values
pnpm dev
```

## Scripts

| Command        | What it does        |
| -------------- | ------------------- |
| `pnpm dev`     | Start the dev server |
| `pnpm build`   | Build for production |
| `pnpm preview` | Preview the build    |
| `pnpm check`   | Type-check           |
| `pnpm lint`    | Lint and format check |
| `pnpm format`  | Format the code      |

## Database

Migrations live in `supabase/`. Apply them with:

```sh
supabase db push
```

## Deploy

- `main` deploys to production
- `staging` gets preview deploys
