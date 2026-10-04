# AGENTS.md

**Tybee Tides** is a family reunion hub for Tybee Island, GA, built with TanStack Start and statically hosted on GitHub Pages.

**Continue from [PLAN.md](./PLAN.md).** Milestones 1–4 have their initial UI/auth/profile implementation; next focus on live voting and the remaining profile/settings polish.

## Stack
TanStack Start + TanStack Router (file routes, static prerender), React 19, Tailwind CSS 4 (theme tokens in `src/styles.css`), lucide-react, Vite 7, GitHub Pages.

## Layout
```
src/
  data/fixtures.ts      # ALL sample data + helpers (publicAsset(), averageRating()). Swap for a backend later if needed.
  components/
    SiteHeader.tsx      # Fixed nav, transparent → solid on scroll; Supabase Google sign-in/profile actions
    AuthProvider.tsx    # Supabase session, per-user profile/travel loading, first-login redirect
    SiteFooter.tsx
    PageHero.tsx        # Inner-page hero with animated waves
    Waves.tsx           # Animated SVG wave divider
    Reveal.tsx          # IntersectionObserver scroll-reveal wrapper
    StarRating.tsx      # Accessible 1–5 radio-group star input
  routes/
    __root.tsx          # Document shell, fonts (Fraunces + Outfit), header/footer
    index.tsx           # Landing page
    vote.tsx            # Voting dashboard (votes kept in localStorage for now)
    faq.tsx             # Travel hub & FAQ
    profile.tsx         # Member onboarding and editable profile/travel details
supabase/migrations/   # SQL tables and Row Level Security for profiles and travel
public/img/             # Generated coastal photos. Resolve paths through publicAsset(path).
```

## Conventions & decisions
- Colors: `sea`, `sea-deep`, `foam`, `tide`, `coral`, `sun`, `sand`, `shell` (defined in `@theme`). Display font: `font-display`.
- Animations are plain CSS (`.reveal`, `.animate-rise`, `.wave-drift`, `.animate-bob`, `.animate-pop`) and respect `prefers-reduced-motion`. There's no animation library.
- Code that touches the browser (localStorage, Date.now countdown, scroll) runs in `useEffect` to avoid SSR hydration mismatches.
- GitHub Pages is static-only; Supabase provides Google auth and per-user profile/travel storage. Votes are currently stored in localStorage.
- Run the SQL migration in `supabase/migrations/` in the Supabase SQL Editor before using profile onboarding.
- Row Level Security limits profile and travel row access to the signed-in owner. Do not add client-side access to service-role credentials.
- Use the `@/` import alias for `src/`.
