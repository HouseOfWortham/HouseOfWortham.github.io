# Tybee Tides — Product Roadmap

A family reunion hub for Tybee Island, GA: browse reunion information, vote on activities, and find travel details.

The site is statically prerendered and hosted on GitHub Pages. Supabase provides Google sign-in, per-user profile/travel storage, and shared activity votes; GitHub Pages itself does not provide server functions or a database.

## Milestone 1 — Product surface ✅
- Coastal-themed landing page: parallax hero, countdown, how-it-works, family branches, crowd-favorite activities, photo wall with placeholders, CTA.
- Interactive voting page: 1–5 star ratings, live family averages and distributions, sorting, progress bar.
- Travel hub & FAQ: confirmed/pending stats, per-branch flight and lodging cards, map and directions, FAQ accordion.
- Activity descriptions and display content live in `src/data/fixtures.ts`; vote counts are loaded from Supabase.

## Milestone 2 — Member data model ✅
- Supabase tables for family groups, member profiles, and per-user travel details are defined in `supabase/migrations/`.
- Row Level Security lets authenticated users read and edit only their own profile and travel rows.
- Shared activity votes were added in Milestone 5; each authenticated user's ratings are private and shared results are aggregate-only.

## Milestone 3 — Google sign-in ✅
- Supabase Google OAuth is wired to the header and landing-page buttons.
- The app restores the Supabase session and offers profile navigation and sign-out.
- Database writes are authorized by Supabase Row Level Security; client-side route behavior is not a security boundary.

## Milestone 4 — Onboarding flow ✅
- First sign-in without a saved profile or travel plan redirects to `/profile`.
- Members choose a family branch and enter their travel and lodging details.
- Saved details can be reviewed and edited on the profile page.
- The FAQ travel hub still displays fixtures; showing shared member details requires an explicit privacy decision and a suitable read policy.

## Milestone 5 — Live voting ✅
- [x] Save votes with an upsert on (user_id, activity_id) the moment a star is tapped.
- [x] Return live averages and distributions from SQL aggregates; light polling or refetch-on-focus so the numbers stay current.

## Milestone 6 — Shared trip schedule ✅
- Four-day meals, activities, and combined timeline views with family-group highlighting.
- Authenticated members can propose and edit meals, assign meal hosts or component claims, and manage activities.
- Schedule data is stored in Supabase and shared with live updates between signed-in members.

## Milestone 7 — Profile & Settings
- Profile page shows the member's name, email, family group, and Google or custom photo URL; name, branch, and travel details are editable.
- Future work: photo uploads, notification settings, and account deletion.

## Milestone 8 — Polish
- Family photo uploads to the album, an admin view for organizers to edit activities and group defaults, and accessibility and performance passes.
