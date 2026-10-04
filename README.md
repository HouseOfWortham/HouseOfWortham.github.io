# Tybee Tides — Family Reunion Hub

A web app for our family reunion on Tybee Island, Georgia (June 18–22, 2027). Family members can see who's coming, vote on activities, and find flight, lodging, and direction details in one place.

## What's live
- **Landing page** (`/`): parallax beach hero, a live countdown, the family branches, crowd-favorite activities, and a photo album.
- **Activity voting** (`/vote`): rate each activity from 1 to 5 stars and watch the family average update right away.
- **Travel hub & FAQ** (`/faq`): arrivals and lodging for each branch, booking progress, a map with directions, and FAQs.

The current screens use sample data from `src/data/fixtures.ts`. Activity votes are saved in the current visitor's browser with `localStorage`.

## Tech
TanStack Start (React 19, file-based routing, statically prerendered), Vite 7, Tailwind CSS 4, and lucide-react. Images are served from `public/img`.

## Run locally
```bash
pnpm install
pnpm dev
```

## Deploy to GitHub Pages
The workflow in `.github/workflows/deploy.yml` builds the site and deploys `dist/client` to GitHub Pages whenever changes are pushed to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

For a project site, the workflow automatically builds with the repository subpath (for example, `/Family-Reunion-2027/`). For a user/organization site, the root path is used automatically. For a custom domain on a project repository, set `VITE_BASE_PATH` to `/` in the workflow build environment.

## Google sign-in with Supabase
The Google sign-in buttons use Supabase Auth. In GitHub, add these as **repository variables** under **Settings → Secrets and variables → Actions → Variables**; the Pages workflow injects them during the build:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (or legacy `anon` key) |

For local development, create an ignored `.env.local` file with the same values, then run `pnpm dev`:

```dotenv
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

These are browser-visible public project credentials; never use the `service_role` key or put the Google OAuth client secret in the app or GitHub variables.

In Supabase **Authentication → URL Configuration**, set the Site URL to the deployed site URL and allow the local URL `http://localhost:3000/**`. For a project site, the deployed URL includes the repository path, such as `https://USERNAME.github.io/Family-Reunion-2027/`. In Google Cloud, the authorized redirect URI remains Supabase's callback URL ending in `/auth/v1/callback`; it is not the GitHub Pages URL.

GitHub Pages is static hosting and cannot run server functions. Sign-in does not by itself persist shared votes or secure database access; those require database tables and Row Level Security policies in Supabase. Activity votes currently remain in each visitor's browser.

## Roadmap
See [PLAN.md](./PLAN.md) for the roadmap. The next milestone is to decide how shared data and sign-in should work before adding features that require a backend.
