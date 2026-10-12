import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Star, Users } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { StarRating } from '@/components/StarRating'
import { PageHero } from '@/components/PageHero'
import { AuthButton } from '@/components/AuthButton'
import { useAuth } from '@/components/AuthProvider'
import { activities, averageRating, publicAsset, type Activity } from '@/data/fixtures'
import { saveActivityVote } from '@/lib/activityVotes'
import { useActivityVotes } from '@/hooks/useActivityVotes'
import { useActivityPhotos } from '@/hooks/useActivityPhotos'

export const Route = createFileRoute('/vote')({
  head: () => ({ meta: [{ title: 'Vote on Activities · Tybee Tides' }] }),
  component: VotePage,
})

type SortKey = 'popular' | 'mine' | 'schedule'

function VotePage() {
  const { session, isConfigured } = useAuth()
  const { counts: voteCounts, myVotes, loading, error, refresh } = useActivityVotes(session?.user.id ?? null)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [voteError, setVoteError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('popular')

  useEffect(() => {
    if (savedId === null) return
    const t = setTimeout(() => setSavedId(null), 1600)
    return () => clearTimeout(t)
  }, [savedId])

  const vote = async (id: number, rating: number) => {
    if (!session || savingId !== null) return
    setSavingId(id)
    setVoteError(null)
    try {
      await saveActivityVote(session.user.id, id, rating)
      setSavedId(id)
      await refresh()
    } catch (saveError) {
      setVoteError(saveError instanceof Error ? saveError.message : 'Could not save your vote.')
    } finally {
      setSavingId(null)
    }
  }

  const rows = useMemo(() => {
    const withStats = activities.map((a, index) => {
      const counts = [...(voteCounts[a.id] ?? [0, 0, 0, 0, 0])]
      const mine = myVotes[a.id]
      const total = counts.reduce((x, y) => x + y, 0)
      return { ...a, index, counts, total, avg: averageRating(counts), mine }
    })
    if (sort === 'popular') withStats.sort((a, b) => b.avg - a.avg)
    if (sort === 'mine') withStats.sort((a, b) => (b.mine ?? 0) - (a.mine ?? 0))
    return withStats
  }, [myVotes, sort, voteCounts])

  const votedCount = Object.keys(myVotes).length
  const progress = (votedCount / activities.length) * 100

  return (
    <>
      <PageHero
        eyebrow="Activity voting"
        title="What should we do on the island?"
        subtitle="Rate each idea from 1 to 5 stars. Your vote is shared with the family and updates the live average."
      />

      <section className="mx-auto max-w-6xl px-5 pb-24">
        {!session && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-sea/75">
              {isConfigured
                ? 'Sign in with Google to save your ratings. Family results are shared with everyone.'
                : 'Shared voting is unavailable until Supabase is configured.'}
            </p>
            <AuthButton />
          </div>
        )}
        {(error || voteError) && (
          <p role="alert" className="mb-6 rounded-2xl bg-coral/10 p-4 text-sm font-medium text-sea">
            {voteError ?? error}
          </p>
        )}
        {loading && <p role="status" className="mb-6 text-sm text-sea/65">Loading shared votes…</p>}
        <div className="sticky top-20 z-30 -mt-10 mb-10 rounded-3xl bg-white/95 p-5 shadow-[0_20px_50px_-25px_rgba(11,59,79,0.45)] backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>
                You’ve rated <strong>{votedCount}</strong> of {activities.length} activities
              </span>
              {votedCount === activities.length && <span className="text-tide">All done, thank you! 🎉</span>}
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-foam">
              <div
                className="h-full rounded-full bg-gradient-to-r from-tide to-coral transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-1 rounded-full bg-sand p-1 text-sm font-medium sm:mt-0">
            {(
              [
                ['popular', 'Most popular'],
                ['mine', 'My ratings'],
                ['schedule', 'Original order'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`rounded-full px-4 py-2 transition ${
                  sort === key ? 'bg-sea text-white shadow' : 'text-sea/70 hover:text-sea'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {rows.map((a, i) => (
            <Reveal key={a.id} delay={(i % 2) * 100}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-20px_rgba(11,59,79,0.35)] sm:flex-row">
                <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-48">
                  <ActivityPhotoCarousel activity={a} />
                  {sort === 'popular' && (
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-sm font-semibold">
                      #{i + 1}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-tide uppercase">
                    <CalendarDays size={14} /> {a.when}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{a.name}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-sea/70">{a.description}</p>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                    <StarRating
                      name={a.name}
                      value={a.mine ?? 0}
                      onChange={(r) => void vote(a.id, r)}
                      disabled={!session || savingId !== null}
                    />
                    <span
                      className={`inline-flex items-center gap-1 rounded-full bg-tide/10 px-3 py-1 text-xs font-semibold text-tide transition-opacity ${
                        savedId === a.id ? 'opacity-100' : 'opacity-0'
                      }`}
                      aria-live="polite"
                    >
                      <Check size={14} /> Saved
                    </span>
                  </div>

                  <div className="mt-5 border-t border-sea/10 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Star size={16} className="fill-sun text-sun" />
                        <span className="tabular-nums">{a.avg.toFixed(2)}</span>
                        <span className="font-normal text-sea/60">family average</span>
                      </span>
                      <span className="flex items-center gap-1 text-sea/60">
                        <Users size={14} /> {a.total} votes
                      </span>
                    </div>
                    <Distribution counts={a.counts} total={a.total} />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}

function ActivityPhotoCarousel({ activity }: { activity: Activity }) {
  const { photos, error } = useActivityPhotos(activity.photoFolderId)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setCurrentIndex(0)
    if (photos.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % photos.length)
    }, 8000)
    return () => window.clearInterval(interval)
  }, [photos])

  const photo = photos[currentIndex]

  return (
    <>
      <img
        key={photo?.id ?? activity.id}
        src={photo?.imageUrl ?? publicAsset(activity.image)}
        alt={photo?.name ?? activity.name}
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      {error && (
        <span role="status" className="absolute inset-x-2 bottom-2 rounded-lg bg-black/65 px-2 py-1 text-center text-xs text-white">
          Activity photos unavailable
        </span>
      )}
      {photo && photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label={`Previous ${activity.name} photo`}
            onClick={() => setCurrentIndex((index) => (index - 1 + photos.length) % photos.length)}
            className="absolute top-1/2 left-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label={`Next ${activity.name} photo`}
            onClick={() => setCurrentIndex((index) => (index + 1) % photos.length)}
            className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </>
  )
}

function Distribution({ counts, total }: { counts: number[]; total: number }) {
  return (
    <div className="mt-3 flex h-10 items-end gap-1.5" aria-hidden>
      {counts.map((c, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-7 w-full items-end overflow-hidden rounded-md bg-foam/60">
            <div
              className="w-full rounded-md bg-tide/70 transition-all duration-700"
              style={{ height: `${total ? (c / total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-sea/50">{i + 1}★</span>
        </div>
      ))}
    </div>
  )
}
