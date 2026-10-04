import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Camera, CheckCircle2, Plane, Star, Users, Vote } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { Waves } from '@/components/Waves'
import { GoogleG } from '@/components/SiteHeader'
import {
  IMAGES,
  REUNION,
  activities,
  averageRating,
  publicAsset,
  familyGroups,
} from '@/data/fixtures'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Branches />
      <ActivityPreview />
      <PhotoWall />
      <ClosingCta />
    </>
  )
}

function Hero() {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) bgRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.35}px, 0) scale(1.1)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="grain relative flex min-h-[100svh] items-center overflow-hidden bg-sea text-white">
      <div
        ref={bgRef}
        className="absolute inset-0 scale-110 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${publicAsset(IMAGES.hero)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-sea/60 via-sea/25 to-sea/70" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-36">
        <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
          {REUNION.dateLabel} · {REUNION.location}
        </p>
        <h1
          className="animate-rise mt-6 max-w-3xl font-display text-5xl leading-[1.02] font-semibold tracking-tight drop-shadow-sm sm:text-7xl"
          style={{ animationDelay: '120ms' }}
        >
          Salt air, good vibes & <em className="text-sun">the whole family</em> together.
        </h1>
        <p
          className="animate-rise mt-6 max-w-xl text-lg text-white/90 sm:text-xl"
          style={{ animationDelay: '240ms' }}
        >
          Welcome to {REUNION.name}, our reunion home base. Sign in, tell us how you’re getting to the island,
          and help pick what we do once everyone’s on the sand.
        </p>
        <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '360ms' }}>
          <button
            type="button"
            className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 font-semibold text-sea shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <GoogleG /> Continue with Google
          </button>
          <Link
            to="/vote"
            className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3.5 font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#ff6a45]"
          >
            Vote on activities <ArrowRight size={18} />
          </Link>
        </div>
        <Countdown />
      </div>
      <Waves />
    </section>
  )
}

function Countdown() {
  const [parts, setParts] = useState<{ label: string; value: number }[] | null>(null)

  useEffect(() => {
    const target = new Date(`${REUNION.startDate}T15:00:00-04:00`).getTime()
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setParts([
        { label: 'days', value: Math.floor(diff / 86_400_000) },
        { label: 'hours', value: Math.floor(diff / 3_600_000) % 24 },
        { label: 'min', value: Math.floor(diff / 60_000) % 60 },
        { label: 'sec', value: Math.floor(diff / 1000) % 60 },
      ])
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="animate-rise mt-14 flex gap-3" style={{ animationDelay: '480ms' }} aria-label="Countdown to the reunion">
      {(parts ?? [{ label: 'days', value: 0 }, { label: 'hours', value: 0 }, { label: 'min', value: 0 }, { label: 'sec', value: 0 }]).map((p) => (
        <div key={p.label} className="w-20 rounded-2xl border border-white/20 bg-white/10 py-3 text-center backdrop-blur-md">
          <div className="font-display text-3xl font-semibold tabular-nums">
            {parts ? String(p.value).padStart(2, '0') : '––'}
          </div>
          <div className="text-xs tracking-widest text-white/70 uppercase">{p.label}</div>
        </div>
      ))}
    </div>
  )
}

const steps = [
  {
    icon: Users,
    title: 'Sign in & pick your branch',
    body: 'One tap with Google, then tell us which side of the family tree you’re representing.',
  },
  {
    icon: Plane,
    title: 'Confirm your travel',
    body: 'We pre-fill your branch’s flights and rental. Confirm it, edit it, or let us know you haven’t booked yet.',
  },
  {
    icon: Vote,
    title: 'Vote on the fun',
    body: 'Rate each activity from one to five stars. The crowd favorites make the final schedule.',
  },
]

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <p className="font-semibold tracking-widest text-tide uppercase">How it works</p>
        <h2 className="mt-2 max-w-2xl font-display text-4xl font-semibold sm:text-5xl">
          Three quick steps from your couch to the coast.
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 120}>
            <div className="group h-full rounded-3xl bg-white p-8 shadow-[0_10px_40px_-20px_rgba(11,59,79,0.35)] transition hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-foam text-tide transition group-hover:rotate-6">
                  <s.icon size={26} />
                </span>
                <span className="font-display text-5xl text-shell">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-sea/70">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Branches() {
  const total = familyGroups.reduce((a, g) => a + g.members, 0)
  return (
    <section className="relative overflow-hidden bg-sea py-24 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <Reveal>
          <p className="font-semibold tracking-widest text-sun uppercase">The family tree</p>
          <h2 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            {total} of us, {familyGroups.length} branches, one island.
          </h2>
          <p className="mt-5 max-w-md text-lg text-white/75">
            Each branch gets its own travel plan, so cousins on the same flight can find each other and
            share a ride from the airport.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {familyGroups.map((g, i) => (
            <Reveal key={g.id} delay={i * 100}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10">
                <span className="block h-1.5 w-12 rounded-full" style={{ background: g.color }} />
                <p className="mt-4 font-display text-xl font-semibold">{g.groupName}</p>
                <p className="text-sm text-white/60">Coming from {g.homeBase}</p>
                <p className="mt-4 text-3xl font-semibold">
                  {g.members}
                  <span className="ml-1 text-sm font-normal text-white/60">travelers</span>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ActivityPreview() {
  const top = [...activities]
    .map((a) => ({ ...a, avg: averageRating(a.ratingCounts) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3)

  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-semibold tracking-widest text-coral uppercase">Crowd favorites</p>
          <h2 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">What the family’s excited about</h2>
        </div>
        <Link to="/vote" className="inline-flex items-center gap-2 font-semibold text-tide hover:gap-3 transition-all">
          Cast your votes <ArrowRight size={18} />
        </Link>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {top.map((a, i) => (
          <Reveal key={a.id} delay={i * 120}>
            <article className="group overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-20px_rgba(11,59,79,0.35)]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={publicAsset(a.image)}
                  alt={a.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold">
                  #{i + 1}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold">{a.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-sea/60">
                  <Star size={16} className="fill-sun text-sun" />
                  <span className="font-semibold text-sea">{a.avg.toFixed(1)}</span> community rating
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function PhotoWall() {
  return (
    <section className="bg-shell/50 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="font-semibold tracking-widest text-tide uppercase">Memories</p>
          <h2 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">The family album</h2>
          <p className="mt-3 max-w-xl text-sea/70">
            Reunion photos from years past live here. Photo uploads open up once everyone can sign in.
          </p>
        </Reveal>
        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
          <Reveal className="col-span-2 row-span-2">
            <img src={publicAsset(IMAGES.family)} alt="Family on the beach at sunset" loading="lazy" className="h-full w-full rounded-3xl object-cover" />
          </Reveal>
          <Reveal delay={100}>
            <img src={publicAsset(IMAGES.lighthouse)} alt="Tybee Island lighthouse" loading="lazy" className="h-full w-full rounded-3xl object-cover" />
          </Reveal>
          <Reveal delay={200}>
            <PhotoPlaceholder label="Grandma’s 80th, 2024" />
          </Reveal>
          <Reveal delay={150}>
            <PhotoPlaceholder label="Cousins’ fishing trip" />
          </Reveal>
          <Reveal delay={250}>
            <img src={publicAsset(IMAGES.dolphins)} alt="Dolphins in the marsh" loading="lazy" className="h-full w-full rounded-3xl object-cover" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-sea/20 bg-white/60 text-center text-sea/50">
      <Camera size={28} />
      <span className="px-3 text-sm font-medium">{label}</span>
    </div>
  )
}

function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-tide to-sea px-8 py-16 text-center text-white sm:px-16">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-sun/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-coral/30 blur-3xl" />
          <h2 className="relative font-display text-4xl font-semibold sm:text-5xl">Got your flight figured out?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">
            The travel hub shows where every branch is staying and when they land, so carpools come together on their own.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-sea transition hover:-translate-y-0.5"
            >
              <CheckCircle2 size={18} /> Open the travel hub
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
