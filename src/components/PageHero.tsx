import { Waves } from './Waves'

// Compact hero used at the top of inner pages.
export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <section className="grain relative overflow-hidden bg-gradient-to-br from-sea via-sea to-tide pt-36 pb-28 text-white">
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-coral/25 blur-3xl" />
      <div className="absolute bottom-0 left-10 h-60 w-60 rounded-full bg-sun/20 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5">
        <p className="animate-rise font-semibold tracking-widest text-sun uppercase">{eyebrow}</p>
        <h1
          className="animate-rise mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl"
          style={{ animationDelay: '100ms' }}
        >
          {title}
        </h1>
        <p className="animate-rise mt-4 max-w-2xl text-lg text-white/80" style={{ animationDelay: '200ms' }}>
          {subtitle}
        </p>
      </div>
      <Waves />
    </section>
  )
}
