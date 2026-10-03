# AGENTS.md

**Tybee Tides** is a family reunion hub for Tybee Island, GA, built with TanStack Start and deployed on Netlify.

**Continue from [PLAN.md](./PLAN.md).** Milestone 1 (the UI surface) is done. Start the next session at Milestone 2.

## Stack
TanStack Start + TanStack Router (file routes), React 19, Tailwind CSS 4 (theme tokens in `src/styles.css`), lucide-react, Vite 7, Netlify.

## Layout
```
src/
  data/fixtures.ts      # ALL sample data + helpers (cdn(), averageRating()). Swap for DB queries later.
  components/
    SiteHeader.tsx      # Fixed nav, transparent → solid on scroll; Google sign-in button (not wired yet)
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
public/img/             # Generated coastal photos. Always serve them through cdn(path, width).
```

## Conventions & decisions
- Colors: `sea`, `sea-deep`, `foam`, `tide`, `coral`, `sun`, `sand`, `shell` (defined in `@theme`). Display font: `font-display`.
- Animations are plain CSS (`.reveal`, `.animate-rise`, `.wave-drift`, `.animate-bob`, `.animate-pop`) and respect `prefers-reduced-motion`. There's no animation library.
- Code that touches the browser (localStorage, Date.now countdown, scroll) runs in `useEffect` to avoid SSR hydration mismatches.
- Persistence will use Netlify Database (Drizzle, `db/schema.ts`), and auth will use Netlify Identity with Google OAuth. Both are platform primitives and take the place of Supabase. Use the `netlify-database` and `netlify-identity` skills.
- Use the `@/` import alias for `src/`.
