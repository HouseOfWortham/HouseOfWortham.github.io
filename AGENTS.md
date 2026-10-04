# AGENTS.md

**Tybee Tides** is a family reunion hub for Tybee Island, GA, built with TanStack Start and statically hosted on GitHub Pages.

**Continue from [PLAN.md](./PLAN.md).** Milestone 1 (the UI surface) is done. Start the next session at Milestone 2.

## Stack
TanStack Start + TanStack Router (file routes, static prerender), React 19, Tailwind CSS 4 (theme tokens in `src/styles.css`), lucide-react, Vite 7, GitHub Pages.

## Layout
```
src/
  data/fixtures.ts      # ALL sample data + helpers (publicAsset(), averageRating()). Swap for a backend later if needed.
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
public/img/             # Generated coastal photos. Resolve paths through publicAsset(path).
```

## Conventions & decisions
- Colors: `sea`, `sea-deep`, `foam`, `tide`, `coral`, `sun`, `sand`, `shell` (defined in `@theme`). Display font: `font-display`.
- Animations are plain CSS (`.reveal`, `.animate-rise`, `.wave-drift`, `.animate-bob`, `.animate-pop`) and respect `prefers-reduced-motion`. There's no animation library.
- Code that touches the browser (localStorage, Date.now countdown, scroll) runs in `useEffect` to avoid SSR hydration mismatches.
- GitHub Pages is static-only; it does not provide server functions, a database, or authentication. Votes are currently stored in localStorage. Choose an external backend before adding shared persistence or sign-in.
- Use the `@/` import alias for `src/`.
