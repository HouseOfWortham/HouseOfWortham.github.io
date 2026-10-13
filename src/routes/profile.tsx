import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BedDouble, ExternalLink, Save, UserRound } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { useAuth } from '@/components/AuthProvider'
import { familyGroups } from '@/data/fixtures'
import { saveMemberDetails } from '@/lib/memberProfile'
import type { TravelStatus } from '@/lib/supabase'
import { TybeeIcon } from '@/components/TybeeIcon'

export const Route = createFileRoute('/profile')({
  head: () => ({ meta: [{ title: 'My Profile · Tybee Tides' }] }),
  component: ProfilePage,
})

type ProfileForm = {
  fullName: string
  avatarUrl: string
  familyGroupId: string
  status: TravelStatus
  travelMode: string
  flightInfo: string
  arrival: string
  notes: string
}

const emptyForm: ProfileForm = {
  fullName: '',
  avatarUrl: '',
  familyGroupId: '',
  status: 'pending',
  travelMode: '',
  flightInfo: '',
  arrival: '',
  notes: '',
}

const fieldClassName =
  'mt-1 w-full rounded-xl border border-sea/15 bg-white px-4 py-3 text-sea outline-none transition placeholder:text-sea/35 focus:border-tide focus:ring-2 focus:ring-tide/20'

function ProfilePage() {
  const { session, profile, travel, profileLoading, error, clearError, refreshProfile } = useAuth()
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return

    const metadata = session.user.user_metadata
    const metadataName =
      typeof metadata.full_name === 'string'
        ? metadata.full_name
        : typeof metadata.name === 'string'
          ? metadata.name
          : ''
    const metadataAvatar =
      typeof metadata.avatar_url === 'string'
        ? metadata.avatar_url
        : typeof metadata.picture === 'string'
          ? metadata.picture
          : ''
    setForm({
      fullName: profile?.full_name ?? metadataName,
      avatarUrl: profile?.avatar_url ?? metadataAvatar,
      familyGroupId: profile ? String(profile.family_group_id) : '',
      status: travel?.status ?? 'pending',
      travelMode: travel?.travel_mode ?? '',
      flightInfo: travel?.flight_info ?? '',
      arrival: travel?.arrival ?? '',
      notes: travel?.notes ?? '',
    })
  }, [profile, session, travel])

  if (!session) {
    return (
      <>
        <PageHero eyebrow="Member profile" title="Your reunion details" subtitle="Sign in with Google to set up your family profile and travel plans." />
        <section className="mx-auto max-w-2xl px-5 py-16">
          <p className="rounded-2xl bg-white p-6 text-sea/70 shadow">Use the Sign in with Google button in the navigation to continue.</p>
        </section>
      </>
    )
  }

  const group = profile ? familyGroups.find((item) => item.id === profile.family_group_id) : undefined
  const metadataAvatar =
    typeof session.user.user_metadata.avatar_url === 'string'
      ? session.user.user_metadata.avatar_url
      : typeof session.user.user_metadata.picture === 'string'
        ? session.user.user_metadata.picture
        : ''
  const avatar = form.avatarUrl || metadataAvatar
  const isFirstSetup = !profile || !travel

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setMessage(null)
    setFormError(null)
    clearError()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) return

    const familyGroupId = Number(form.familyGroupId)
    if (!Number.isInteger(familyGroupId) || !familyGroups.some((item) => item.id === familyGroupId)) {
      setFormError('Choose your family branch before saving.')
      return
    }

    setSaving(true)
    setFormError(null)
    setMessage(null)
    clearError()
    try {
      await saveMemberDetails({
        userId: session.user.id,
        fullName: form.fullName.trim(),
        avatarUrl: form.avatarUrl.trim(),
        familyGroupId,
        status: form.status,
        travelMode: form.travelMode.trim(),
        flightInfo: form.flightInfo.trim(),
        arrival: form.arrival.trim(),
        notes: form.notes.trim(),
      })
      await refreshProfile()
      setMessage('Your profile and travel plans have been saved.')
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Could not save your details. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow={isFirstSetup ? 'Welcome to the family' : 'Member profile'}
        title={isFirstSetup ? 'Let’s get you settled in' : 'Your reunion profile'}
        subtitle={
          isFirstSetup
            ? 'Choose your family branch and share your travel plans so everyone can coordinate.'
            : 'Review your family information and update your travel plans whenever they change.'
        }
      />
      <section className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
        <Reveal>
          <div className="mb-8 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_10px_40px_-20px_rgba(11,59,79,0.35)]">
            {avatar ? (
              <img src={avatar} alt="" className="h-16 w-16 rounded-full bg-foam object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-foam text-tide"><UserRound size={28} /></span>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl font-semibold">{profile?.full_name || session.user.user_metadata.full_name || 'Family member'}</h2>
              <p className="truncate text-sm text-sea/60">{session.user.email}</p>
              {group && <p className="mt-1 text-sm font-medium text-tide">{group.groupName}</p>}
            </div>
          </div>
        </Reveal>

        {profileLoading ? (
          <p role="status" className="rounded-2xl bg-white p-6 text-sea/70 shadow">Loading your saved details…</p>
        ) : (
          <Reveal delay={80}>
            <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-6 shadow-[0_15px_50px_-25px_rgba(11,59,79,0.4)] sm:p-9">
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-foam text-tide"><UserRound size={20} /></span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold">About you</h2>
                    <p className="text-sm text-sea/60">Your reunion name and family branch.</p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Name
                    <input autoComplete="name" required maxLength={100} className={fieldClassName} value={form.fullName} onChange={(event) => update('fullName', event.target.value)} />
                  </label>
                  <label className="text-sm font-semibold">
                    Family branch
                    <select required className={fieldClassName} value={form.familyGroupId} onChange={(event) => update('familyGroupId', event.target.value)}>
                      <option value="" disabled>Choose your family branch</option>
                      {familyGroups.map((item) => (
                        <option key={item.id} value={item.id}>{item.groupName}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Profile photo URL <span className="font-normal text-sea/50">(optional; Google photo used by default)</span>
                    <input type="url" maxLength={2048} className={fieldClassName} placeholder="https://…" value={form.avatarUrl} onChange={(event) => update('avatarUrl', event.target.value)} />
                  </label>
                </div>
              </section>

              <section className="border-t border-sea/10 pt-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-foam text-tide"><TybeeIcon icon="plane" size={24} /></span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Travel plans</h2>
                    <p className="text-sm text-sea/60">Share what you know now; you can edit this later.</p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Booking status
                    <select className={fieldClassName} value={form.status} onChange={(event) => update('status', event.target.value as TravelStatus)}>
                      <option value="pending">Booking is in progress</option>
                      <option value="confirmed">Travel is confirmed</option>
                      <option value="not_booked">I haven’t booked yet</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    How are you traveling?
                    <select className={fieldClassName} value={form.travelMode} onChange={(event) => update('travelMode', event.target.value)}>
                      <option value="">Choose travel method</option>
                      <option value="Flying">Flying</option>
                      <option value="Driving">Driving</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Flight or route details
                    <input maxLength={300} className={fieldClassName} placeholder="Airline / flight number or driving route" value={form.flightInfo} onChange={(event) => update('flightInfo', event.target.value)} />
                  </label>
                  <label className="text-sm font-semibold">
                    Arrival date and time
                    <input maxLength={100} className={fieldClassName} placeholder="For example: Thursday afternoon" value={form.arrival} onChange={(event) => update('arrival', event.target.value)} />
                  </label>
                  <div className="rounded-2xl bg-foam/60 p-4 text-sm sm:col-span-2">
                    <p className="flex items-center gap-2 font-semibold text-sea">
                      <BedDouble size={17} className="text-tide" /> Shared reunion lodging
                    </p>
                    <p className="mt-1 text-sea/70">
                      The family is staying at the Historic 3 Unit Beach House for Families on North Beach.
                    </p>
                    <a
                      href="https://www.vrbo.com/4310560"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 font-semibold text-tide hover:text-sea"
                    >
                      View the VRBO listing <ExternalLink size={14} />
                    </a>
                  </div>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Notes for your family branch <span className="font-normal text-sea/50">(optional)</span>
                    <textarea rows={3} maxLength={1000} className={fieldClassName} placeholder="Car seats, accessibility needs, or anything helpful for coordinating…" value={form.notes} onChange={(event) => update('notes', event.target.value)} />
                  </label>
                </div>
              </section>

              {(formError || error) && (
                <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-[#9f3420]">
                  {formError || error}
                </p>
              )}
              {message && <p role="status" className="rounded-xl bg-foam px-4 py-3 text-sm font-medium text-tide">{message}</p>}
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-sea px-6 py-3 font-semibold text-white transition hover:bg-tide disabled:cursor-wait disabled:opacity-60">
                <Save size={18} /> {saving ? 'Saving…' : isFirstSetup ? 'Save profile and travel plans' : 'Save changes'}
              </button>
            </form>
          </Reveal>
        )}
      </section>
    </>
  )
}
