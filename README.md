# Tybee Tides — Family Reunion Hub

A web app for our family reunion on Tybee Island, Georgia (June 18–22, 2027). Family members can see who's coming, vote on activities, and find flight, lodging, and direction details in one place.

## What's live
- **Landing page** (`/`): parallax beach hero, a live countdown, the family branches, crowd-favorite activities, and a photo album.
- **Activity voting** (`/vote`): rate each activity from 1 to 5 stars and watch the family average update right away.
- **Travel hub & FAQ** (`/faq`): arrivals and lodging for each branch, booking progress, a map with directions, and FAQs.

The screens use sample content from `src/data/fixtures.ts`. Activity votes and family rating totals are stored in Supabase and shared across visitors.

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
VITE_GOOGLE_DRIVE_API_KEY=YOUR_RESTRICTED_GOOGLE_API_KEY
VITE_GOOGLE_DRIVE_PRIOR_TRIPS_FOLDER_ID=YOUR_PAST_PHOTOS_FOLDER_ID
VITE_GOOGLE_DRIVE_CURRENT_TRIP_FOLDER_ID=YOUR_CURRENT_TRIP_FOLDER_ID
```

These are browser-visible public project credentials; never use the `service_role` key or put the Google OAuth client secret in the app or GitHub variables.

### Google Drive photo gallery
The home page reads images from two Google Drive folders. Create a Google API key with the **Google Drive API** enabled, restrict the key to that API and to the website's HTTP referrers (including `http://localhost:3000/*` for local development), and configure these values:

| Variable | Value |
|---|---|
| `VITE_GOOGLE_DRIVE_API_KEY` | Restricted Google API key; it is public in the built site, so referrer and API restrictions are required |
| `VITE_GOOGLE_DRIVE_PRIOR_TRIPS_FOLDER_ID` | Folder ID for past reunion photos |
| `VITE_GOOGLE_DRIVE_CURRENT_TRIP_FOLDER_ID` | Folder ID for this trip's photos |

Add them as GitHub repository variables for Pages builds. For local development, add the same names to the ignored `.env.local` file. Set both folders' general access to **Anyone with the link — Viewer** so the public gallery can list and display images. The current-trip folder's upload link opens Google Drive; family members need a Google account with **Editor** access to add photos. The site does not upload directly or make private photos public.

If an API key was pasted into a chat, issue tracker, or source file, rotate it in Google Cloud before configuring the site. Never commit the key to source code. The API key is visible to visitors by design; restrictions limit its use but do not make it secret.

In Supabase **Authentication → URL Configuration**, set the Site URL to the deployed site URL and allow the local URL `http://localhost:3000/**`. For a project site, the deployed URL includes the repository path, such as `https://USERNAME.github.io/Family-Reunion-2027/`. In Google Cloud, the authorized redirect URI remains Supabase's callback URL ending in `/auth/v1/callback`; it is not the GitHub Pages URL.

### Member profiles and travel plans
To enable family onboarding and saved profiles, open the Supabase **SQL Editor**, paste and run [`supabase/migrations/20261004163000_member_profiles_and_travel.sql`](./supabase/migrations/20261004163000_member_profiles_and_travel.sql). It creates the five family branches, a profile and travel-details table, and Row Level Security policies that allow signed-in users to read or update only their own details.

After signing in, members without a saved profile or travel plan are sent to `/profile` to choose a branch and enter their details. They can return from the Profile link to edit them. The Google profile photo is used by default; the form also allows an optional image URL, not a file upload.

GitHub Pages is static hosting and cannot run server functions. Profile/travel records and activity votes are stored in Supabase. Other members' travel details are not exposed by the profile setup.

### Shared activity voting
After applying the member profile migration, run [`supabase/migrations/20261008150700_shared_activity_voting.sql`](./supabase/migrations/20261008150700_shared_activity_voting.sql) in the Supabase SQL Editor. Members must sign in to submit or change their own 1–5 star ratings. Only each member's own vote rows are readable directly; a database function returns grouped counts for the shared averages without exposing individual votes. The app refreshes those counts on page focus and every 30 seconds.

The migration currently allows activity IDs 1–6, matching the six entries in `src/data/fixtures.ts`. If activities are added or IDs change, update the activity ID check constraint in a follow-up migration.

## Roadmap
See [PLAN.md](./PLAN.md) for the roadmap. Shared live voting is implemented; the next milestone is profile and settings polish.
