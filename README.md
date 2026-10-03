# Tybee Tides — Family Reunion Hub

A web app for our family reunion on Tybee Island, Georgia (June 18–22, 2027). Family members can see who's coming, vote on activities, and find flight, lodging, and direction details in one place.

## What's live
- **Landing page** (`/`): parallax beach hero, a live countdown, the family branches, crowd-favorite activities, and a photo album.
- **Activity voting** (`/vote`): rate each activity from 1 to 5 stars and watch the family average update right away.
- **Travel hub & FAQ** (`/faq`): arrivals and lodging for each branch, booking progress, a map with directions, and FAQs.

The current screens use sample data from `src/data/fixtures.ts`.

## Tech
TanStack Start (React 19, file-based routing), Tailwind CSS 4, lucide-react icons, and the Netlify Image CDN for the coastal photography in `public/img`. It deploys to Netlify.

## Run locally
```bash
pnpm install
netlify dev   # or: pnpm dev
```

## Roadmap
See [PLAN.md](./PLAN.md). Next up: the database schema (Netlify Database + Drizzle), Google sign-in through Netlify Identity, the family-group and travel onboarding flow, saving votes, and the Profile & Settings page.
