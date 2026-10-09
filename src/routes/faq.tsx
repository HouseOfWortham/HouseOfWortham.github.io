import { useCallback, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BedDouble, Car, ChevronDown, ExternalLink, MapPin, Navigation, Plane, Users } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { PageHero } from '@/components/PageHero'
import { AuthButton } from '@/components/AuthButton'
import { useAuth } from '@/components/AuthProvider'
import { REUNION, faqs, familyGroups } from '@/data/fixtures'
import { getSupabaseClient } from '@/lib/supabase'

export const Route = createFileRoute('/faq')({
  head: () => ({ meta: [{ title: 'Travel Hub & FAQ · Tybee Tides' }] }),
  component: FaqPage,
})

const directions = [
  { icon: Plane, title: 'From SAV airport', body: 'I-95 S → I-16 E into Savannah, then US-80 E all the way to the island. About 35 minutes.' },
  { icon: Car, title: 'Driving in from I-95', body: 'Take exit 99A to I-16 E, follow signs for Tybee Island / US-80 E. The last causeway is gorgeous at sunset.' },
  { icon: MapPin, title: 'Reunion home base', body: 'The shared family rental is in the North Beach area. See the VRBO listing above for the property details.' },
]

const vrboUrl = 'https://www.vrbo.com/4310560'
type FamilyTravelSummary = {
  family_group_id: number
  travel_mode: string
  status: string
  member_count: number
}

function FaqPage() {
  const { session } = useAuth()
  const [summaries, setSummaries] = useState<FamilyTravelSummary[]>([])
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const loadSummaries = useCallback(async () => {
    if (!session) {
      setSummaries([])
      setSummaryError(null)
      setSummaryLoading(false)
      return
    }

    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase.rpc('get_family_travel_summaries')
      if (error) throw error
      setSummaries(data)
      setSummaryError(null)
    } catch (loadError) {
      setSummaryError(loadError instanceof Error ? loadError.message : 'Could not load family travel summaries.')
    } finally {
      setSummaryLoading(false)
    }
  }, [session])

  useEffect(() => {
    void loadSummaries()
    if (!session) return

    window.addEventListener('focus', loadSummaries)
    return () => window.removeEventListener('focus', loadSummaries)
  }, [loadSummaries, session])

  const memberCount = summaries.reduce((total, row) => total + row.member_count, 0)
  const confirmedCount = summaries.reduce(
    (total, row) => total + (row.status === 'confirmed' ? row.member_count : 0),
    0,
  )
  const sharedMethodCount = summaries.reduce(
    (total, row) => total + (row.travel_mode === 'Not shared yet' ? 0 : row.member_count),
    0,
  )

  return (
    <>
      <PageHero
        eyebrow="Travel hub"
        title="Everything you need to get to the island"
        subtitle="Shared lodging details, group-level travel plans, and directions for getting to Tybee."
      />

      <section className="mx-auto -mt-12 max-w-6xl px-5">
        <div className="relative z-10 grid gap-4 sm:grid-cols-3">
          <Stat label="Family profiles" value={summaryLoading ? '…' : session ? String(memberCount) : '—'} accent="text-sea" />
          <Stat label="Travel methods shared" value={summaryLoading ? '…' : session ? String(sharedMethodCount) : '—'} accent="text-tide" />
          <Stat label="Travel confirmed" value={summaryLoading ? '…' : session ? String(confirmedCount) : '—'} accent="text-coral" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-semibold tracking-widest text-tide uppercase">Our shared home</p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">One place for the whole family</h2>
            </div>
            <a
              href={vrboUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-tide px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sea"
            >
              View the VRBO listing <ExternalLink size={16} />
            </a>
          </div>
          <div className="mt-6 rounded-3xl bg-white p-7 shadow-[0_10px_40px_-20px_rgba(11,59,79,0.35)] sm:p-9">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-foam text-tide">
                <BedDouble size={24} />
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold">Historic 3 Unit Beach House for Families</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-sea/65">
                  <MapPin size={15} /> North Beach, Tybee Island, Georgia
                </p>
                <p className="mt-4 max-w-3xl leading-relaxed text-sea/75">
                  The reunion is staying together at this shared VRBO property. Open the listing for the property description,
                  photos, amenities, and booking details. Coordinate room assignments and arrival with the reunion organizer.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">How each branch is getting here</h2>
          <p className="mt-2 text-sea/70">
            Group totals from members’ saved profiles. Personal flight numbers and arrival details are not shown here.
          </p>
        </Reveal>
        {!session && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-sea/75">Sign in to see the family’s shared travel summary.</p>
            <AuthButton />
          </div>
        )}
        {session && summaryError && (
          <p role="alert" className="mt-8 rounded-2xl bg-coral/10 p-5 text-sm text-sea">
            Could not load travel summaries: {summaryError}. Apply the latest family travel summary migration in Supabase.
          </p>
        )}
        {session && summaryLoading && <p role="status" className="mt-8 text-sea/65">Loading travel summaries…</p>}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {session && !summaryLoading && !summaryError && familyGroups.map((group, i) => {
            const groupRows = summaries.filter((row) => row.family_group_id === group.id)
            const groupSize = groupRows.reduce((total, row) => total + row.member_count, 0)
            const methods = groupRows.reduce((totals, row) => {
              if (row.travel_mode !== 'Not shared yet') {
                totals.set(row.travel_mode, (totals.get(row.travel_mode) ?? 0) + row.member_count)
              }
              return totals
            }, new Map<string, number>())
            const methodCount = [...methods.values()].reduce((total, count) => total + count, 0)
            const statuses = groupRows.reduce((totals, row) => {
              totals.set(row.status, (totals.get(row.status) ?? 0) + row.member_count)
              return totals
            }, new Map<string, number>())
            return (
              <Reveal key={group.id} delay={(i % 2) * 120}>
                <article className="relative h-full overflow-hidden rounded-3xl bg-white p-7 shadow-[0_10px_40px_-20px_rgba(11,59,79,0.35)]">
                  <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: group.color }} />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-semibold">{group.groupName}</h3>
                      <p className="text-sm text-sea/60">From {group.homeBase}</p>
                    </div>
                    <span className="rounded-full bg-foam px-3 py-1 text-xs font-semibold text-tide">
                      <Users size={13} className="mr-1 inline" /> {groupSize} {groupSize === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <div className="mt-6">
                    <p className="text-xs font-semibold tracking-wider text-sea/50 uppercase">Travel methods shared</p>
                    {methods.size > 0 ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {[...methods].map(([mode, count]) => (
                          <li key={mode} className="rounded-full bg-sand px-3 py-1.5 text-sm font-medium">
                            {mode} · {count}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-sea/60">No travel methods shared yet.</p>
                    )}
                    <p className="mt-4 text-sm text-sea/60">
                      {methodCount} of {groupSize} {groupSize === 1 ? 'member has' : 'members have'} shared a travel method.
                    </p>
                    {statuses.size > 0 && (
                      <p className="mt-2 text-xs text-sea/50">
                        Booking: {[...statuses].map(([status, count]) => {
                          const label = {
                            confirmed: 'confirmed',
                            pending: 'in progress',
                            not_booked: 'not booked',
                            not_submitted: 'not submitted',
                          }[status] ?? status
                          return `${count} ${label}`
                        }).join(' · ')}
                      </p>
                    )}
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
        {session && !summaryLoading && !summaryError && summaries.length === 0 && (
          <p className="mt-8 rounded-2xl bg-white p-5 text-sea/65 shadow">
            No family profiles or travel plans have been saved yet.
          </p>
        )}
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
