# Tybee Tides — Product Roadmap

A family reunion hub for Tybee Island, GA: sign in with Google, pick your family branch, confirm travel, vote on activities, and browse a shared travel hub.

Data is stored in **Netlify Database** (managed Postgres, via Drizzle ORM) and sign-in uses **Netlify Identity** with the Google OAuth provider. Both run on the same platform that hosts the site, so there's one place to deploy, one set of environment settings, and no separate service to manage. The table design below follows the original schema guidelines (`profiles`, `family_groups`, `travel_details`, `activities`, `votes`).

## Milestone 1 — Product surface ✅
- Coastal-themed landing page: parallax hero, countdown, how-it-works, family branches, crowd-favorite activities, photo wall with placeholders, CTA.
- Interactive voting page: 1–5 star ratings, live family averages and distributions, sorting, progress bar.
- Travel hub & FAQ: confirmed/pending stats, per-branch flight and lodging cards, map and directions, FAQ accordion.
- All sample data lives in `src/data/fixtures.ts`. Votes are kept in `localStorage` for now.

## Milestone 2 — Data model
- `db/schema.ts` with Drizzle tables: `family_groups`, `profiles` (keyed by Identity user id), `travel_details` (status: confirmed / pending / not_booked), `activities`, `votes` (unique per user + activity, rating CHECK 1–5).
- Seed family groups, group travel defaults, and activities from the current fixtures.
- Replace fixture reads with TanStack Start server functions.

## Milestone 3 — Google sign-in & protected routes
- Enable Netlify Identity with the Google provider; wire the header and hero "Sign in with Google" buttons.
- Route guards: `/vote`, `/faq`, `/profile`, `/welcome` require a session; landing stays public.
- Server functions verify the user on every write.

## Milestone 4 — Onboarding flow
- First-login interception → `/welcome`: choose your Family Group.
- Show that group's default flight and lodging, with three choices: **Confirm**, **I haven't booked yet**, **Add/Edit my own details**.
- Writes to `travel_details`; travel hub totals switch from fixtures to live aggregates.

## Milestone 5 — Live voting
- Save votes with an upsert on (user_id, activity_id) the moment a star is tapped.
- Return live averages and distributions from SQL aggregates; light polling or refetch-on-focus so the numbers stay current.

## Milestone 6 — Profile & Settings
- Split layout. Section A: avatar (synced from Google, or upload to Netlify Blobs), first/last name, family group. Section B: email/SMS notification toggles, sign-out, and account deletion.

## Milestone 7 — Polish
- Family photo uploads to the album (Netlify Blobs + Image CDN), an admin view for organizers to edit activities and group defaults, and accessibility and performance passes.
