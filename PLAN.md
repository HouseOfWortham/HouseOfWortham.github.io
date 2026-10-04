# Tybee Tides — Product Roadmap

A family reunion hub for Tybee Island, GA: browse reunion information, vote on activities, and find travel details.

The site is statically prerendered and hosted on GitHub Pages. GitHub Pages does not provide server functions, a database, or authentication. The current UI uses fixture data, and votes are saved only in each visitor's browser. Choose an external backend before implementing shared data or sign-in. The table design below is a possible future model (`profiles`, `family_groups`, `travel_details`, `activities`, `votes`), not a platform commitment.

## Milestone 1 — Product surface ✅
- Coastal-themed landing page: parallax hero, countdown, how-it-works, family branches, crowd-favorite activities, photo wall with placeholders, CTA.
- Interactive voting page: 1–5 star ratings, live family averages and distributions, sorting, progress bar.
- Travel hub & FAQ: confirmed/pending stats, per-branch flight and lodging cards, map and directions, FAQ accordion.
- All sample data lives in `src/data/fixtures.ts`. Votes are kept in `localStorage` for now.

## Milestone 2 — Shared data approach
- Decide whether shared voting, travel confirmations, and profiles are needed for this reunion.
- If so, choose an external backend that supports database access and server-side authorization; GitHub Pages cannot run server functions.
- Only then define the schema and move data out of `src/data/fixtures.ts`.

## Milestone 3 — Google sign-in & protected routes
- Choose an identity provider and backend that can verify users on every write.
- Wire the header and hero "Sign in with Google" buttons only after that choice.
- Route guards cannot secure data by themselves; enforce authorization on the backend.

## Milestone 4 — Onboarding flow
- First-login interception → `/welcome`: choose your Family Group.
- Show that group's default flight and lodging, with three choices: **Confirm**, **I haven't booked yet**, **Add/Edit my own details**.
- Writes to `travel_details`; travel hub totals switch from fixtures to live aggregates.

## Milestone 5 — Live voting
- Save votes with an upsert on (user_id, activity_id) the moment a star is tapped.
- Return live averages and distributions from SQL aggregates; light polling or refetch-on-focus so the numbers stay current.

## Milestone 6 — Profile & Settings
- Split layout. Section A: avatar (synced from Google, or upload to a chosen storage service), first/last name, family group. Section B: email/SMS notification toggles, sign-out, and account deletion.

## Milestone 7 — Polish
- Family photo uploads to the album, an admin view for organizers to edit activities and group defaults, and accessibility and performance passes.
