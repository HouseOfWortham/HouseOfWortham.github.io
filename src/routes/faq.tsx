import { createFileRoute } from '@tanstack/react-router'
import { BedDouble, Car, ChevronDown, Clock, MapPin, Navigation, Plane } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { PageHero } from '@/components/PageHero'
import { REUNION, faqs, familyGroups, travelByGroup } from '@/data/fixtures'

export const Route = createFileRoute('/faq')({
  head: () => ({ meta: [{ title: 'Travel Hub & FAQ · Tybee Tides' }] }),
  component: FaqPage,
})

const directions = [
  { icon: Plane, title: 'From SAV airport', body: 'I-95 S → I-16 E into Savannah, then US-80 E all the way to the island. About 35 minutes.' },
  { icon: Car, title: 'Driving in from I-95', body: 'Take exit 99A to I-16 E, follow signs for Tybee Island / US-80 E. The last causeway is gorgeous at sunset.' },
  { icon: MapPin, title: 'Home base', body: 'Most branches are near North Beach and the pier. Group meetups at the Tybee Pier & Pavilion.' },
]

function FaqPage() {
  const confirmed = travelByGroup.reduce((a, t) => a + t.confirmed, 0)
  const pending = travelByGroup.reduce((a, t) => a + t.pending, 0)
  const rate = Math.round((confirmed / (confirmed + pending)) * 100)

  return (
    <>
      <PageHero
        eyebrow="Travel hub"
        title="Everything you need to get to the island"
        subtitle="Flights, lodging, and directions for every branch, pulled together from the details each family shares."
      />

      <section className="mx-auto -mt-12 max-w-6xl px-5">
        <div className="relative z-10 grid gap-4 sm:grid-cols-3">
          <Stat label="Travelers confirmed" value={String(confirmed)} accent="text-tide" />
          <Stat label="Still booking" value={String(pending)} accent="text-coral" />
          <Stat label="Travel plans locked in" value={`${rate}%`} accent="text-sea" bar={rate} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Who’s arriving when</h2>
          <p className="mt-2 text-sea/70">Find your branch, then find your carpool.</p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {travelByGroup.map((t, i) => {
            const group = familyGroups.find((g) => g.id === t.familyGroupId)!
            const pct = Math.round((t.confirmed / (t.confirmed + t.pending)) * 100)
            return (
              <Reveal key={t.familyGroupId} delay={(i % 2) * 120}>
                <article className="relative h-full overflow-hidden rounded-3xl bg-white p-7 shadow-[0_10px_40px_-20px_rgba(11,59,79,0.35)]">
                  <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: group.color }} />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-semibold">{group.groupName}</h3>
                      <p className="text-sm text-sea/60">From {group.homeBase}</p>
                    </div>
                    <span className="rounded-full bg-foam px-3 py-1 text-xs font-semibold text-tide">
                      {t.confirmed}/{t.confirmed + t.pending} confirmed
                    </span>
                  </div>
                  <dl className="mt-6 space-y-4 text-sm">
                    <Detail icon={Plane} label="Getting there" value={t.flight} />
                    <Detail icon={Clock} label="Arrives" value={t.arrival} />
                    <Detail icon={BedDouble} label="Staying at" value={`${t.lodging} · ${t.lodgingAddress}`} />
                  </dl>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-foam">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: group.color }} />
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="bg-sea py-20 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Maps & directions</h2>
            <p className="mt-2 text-white/70">Nearest airport: {REUNION.nearestAirport}</p>
            <div className="mt-8 space-y-5">
              {directions.map((d) => (
                <div key={d.title} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-sun">
                    <d.icon size={20} />
                  </span>
                  <div>
                    <p className="font-semibold">{d.title}</p>
                    <p className="text-sm leading-relaxed text-white/70">{d.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Tybee+Island+Pier+and+Pavilion"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-5 py-3 font-semibold transition hover:-translate-y-0.5"
            >
              <Navigation size={18} /> Get directions
            </a>
          </Reveal>
          <Reveal delay={150}>
            <div className="h-full min-h-80 overflow-hidden rounded-3xl border border-white/10">
              <iframe
                title="Map of Tybee Island, GA"
                src="https://www.google.com/maps?q=Tybee+Island,+GA&z=13&output=embed"
                className="h-full min-h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">Frequently asked</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="group rounded-2xl bg-white p-5 shadow-[0_6px_30px_-20px_rgba(11,59,79,0.4)] open:shadow-[0_10px_40px_-20px_rgba(11,59,79,0.5)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <ChevronDown size={20} className="shrink-0 text-tide transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 leading-relaxed text-sea/70">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}

function Stat({ label, value, accent, bar }: { label: string; value: string; accent: string; bar?: number }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-25px_rgba(11,59,79,0.45)]">
      <p className={`font-display text-4xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-1 text-sm font-medium text-sea/60">{label}</p>
      {bar !== undefined && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-foam">
          <div className="h-full rounded-full bg-gradient-to-r from-tide to-coral" style={{ width: `${bar}%` }} />
        </div>
      )}
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: typeof Plane; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon size={18} className="mt-0.5 shrink-0 text-tide" />
      <div>
        <dt className="text-xs font-semibold tracking-wider text-sea/50 uppercase">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  )
}
