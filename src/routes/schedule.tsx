import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Check, MapPin, Pencil, Plus, X } from 'lucide-react'
import { TybeeIcon } from '@/components/TybeeIcon'
import { AuthButton } from '@/components/AuthButton'
import { useAuth } from '@/components/AuthProvider'
import { PageHero } from '@/components/PageHero'
import { familyGroups } from '@/data/fixtures'
import {
  getSupabaseClient,
  isSupabaseConfigured,
  type Json,
  type ScheduleActivityRow,
  type ScheduleMealRow,
} from '@/lib/supabase'

export const Route = createFileRoute('/schedule')({
  head: () => ({ meta: [{ title: 'Trip Schedule · Tybee Tides' }] }),
  component: SchedulePage,
})

type ViewMode = 'meals' | 'activities' | 'combined'
type GroupId = (typeof familyGroups)[number]['id']
type MealType = ScheduleMealRow['meal_type']
type ComponentSlot = { id: string; label: string; claimedBy: GroupId | null }
type MealDraft = {
  id: string
  dayNumber: number
  mealType: MealType
  timeSlot: string
  title: string
  notes: string
  splitMode: 'single' | 'components'
  hostedBy: GroupId | null
  components: ComponentSlot[]
}
type ActivityDraft = {
  id?: string
  dayNumber: number
  timeSlot: string
  title: string
  description: string
  location: string
  organizedBy: GroupId | null
}
type EditorState =
  | { type: 'meal'; meal: MealDraft }
  | { type: 'activity'; activity: ActivityDraft }
  | null

const days = [
  { number: 1, label: 'Thu, Jun 10' },
  { number: 2, label: 'Fri, Jun 11' },
  { number: 3, label: 'Sat, Jun 12' },
  { number: 4, label: 'Sun, Jun 13' },
] as const

const defaultMealTimes: Record<MealType, string> = {
  Breakfast: '08:00',
  Lunch: '12:30',
  Dinner: '18:30',
}

function formatTime(timeSlot: string) {
  const match = timeSlot.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return timeSlot
  const hour = Number(match[1])
  const minutes = Number(match[2])
  if (hour > 23 || minutes > 59) return timeSlot
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
    new Date(2000, 0, 1, hour, minutes),
  )
}

const groupFilters = [
  { id: null, label: 'All groups' },
  { id: 2, label: 'Badger Borough' },
  { id: 1, label: 'Hambelton Homestead' },
  { id: 3, label: 'Treasure Valley Hunts' },
  { id: 4, label: 'Marevelous McBrides' },
  { id: 5, label: 'Wortham Wing' },
] as const

const groupBadgeClasses: Record<GroupId, string> = {
  1: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  2: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
  3: 'bg-amber-100 text-amber-900 ring-amber-200',
  4: 'bg-teal-100 text-teal-800 ring-teal-200',
  5: 'bg-rose-100 text-rose-800 ring-rose-200',
}

const groupShortNames: Record<GroupId, string> = {
  1: 'Hambelton',
  2: 'Badger',
  3: 'Hunt',
  4: 'McBride',
  5: 'Wortham',
}

function readComponents(value: Json): ComponentSlot[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      Array.isArray(item)
    ) {
      return []
    }
    if (
      typeof item.id !== 'string' ||
      typeof item.label !== 'string' ||
      (typeof item.claimedBy !== 'number' && item.claimedBy !== null)
    ) {
      return []
    }
    return [{ id: item.id, label: item.label, claimedBy: item.claimedBy as GroupId | null }]
  })
}

function toMealDraft(row: ScheduleMealRow): MealDraft {
  return {
    id: row.id,
    dayNumber: row.day_number,
    mealType: row.meal_type,
    timeSlot: row.time_slot || defaultMealTimes[row.meal_type],
    title: row.title ?? '',
    notes: row.notes,
    splitMode: row.split_mode,
    hostedBy: row.hosted_by_group_id as GroupId | null,
    components: readComponents(row.components),
  }
}

function isAssignedToMeal(meal: ScheduleMealRow, groupId: GroupId) {
  return (
    meal.hosted_by_group_id === groupId ||
    readComponents(meal.components).some((component) => component.claimedBy === groupId)
  )
}

function activityTimeOrder(timeSlot: string) {
  const twentyFourHourMatch = timeSlot.match(/^(\d{1,2}):(\d{2})$/)
  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1])
    const minutes = Number(twentyFourHourMatch[2])
    if (hour <= 23 && minutes <= 59) return hour * 60 + minutes
  }

  const match = timeSlot.match(/\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\b/i)
  if (match) {
    const hour = Number(match[1]) % 12
    const minutes = Number(match[2] ?? 0)
    if (minutes > 59) return 23 * 60
    return (hour + (match[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + minutes
  }
  const timeframe = timeSlot.toLowerCase()
  if (timeframe.includes('morning')) return 9 * 60
  if (timeframe.includes('noon') || timeframe.includes('midday')) return 12 * 60
  if (timeframe.includes('afternoon')) return 15 * 60
  if (timeframe.includes('evening')) return 18 * 60
  return 23 * 60
}

function buildTimeline(dayMeals: ScheduleMealRow[], dayActivities: ScheduleActivityRow[]) {
  return [
    ...dayMeals.map((meal) => ({
      kind: 'meal' as const,
      sortTime: activityTimeOrder(meal.time_slot || defaultMealTimes[meal.meal_type]),
      meal,
    })),
    ...dayActivities.map((activity) => ({
      kind: 'activity' as const,
      sortTime: activityTimeOrder(activity.time_slot),
      activity,
    })),
  ].sort((a, b) => a.sortTime - b.sortTime)
}

function SchedulePage() {
  const { session, profile, isConfigured, profileLoading } = useAuth()
  const [view, setView] = useState<ViewMode>('combined')
  const [filterGroup, setFilterGroup] = useState<GroupId | null>(null)
  const [meals, setMeals] = useState<ScheduleMealRow[]>([])
  const [activities, setActivities] = useState<ScheduleActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>(null)

  const loadSchedule = useCallback(async () => {
    if (!session || !isSupabaseConfigured) return
    try {
      const supabase = await getSupabaseClient()
      const [mealResult, activityResult] = await Promise.all([
        supabase.from('schedule_meals').select('*').order('day_number').order('meal_type'),
        supabase.from('schedule_activities').select('*').order('day_number').order('time_slot'),
      ])
      if (mealResult.error) throw mealResult.error
      if (activityResult.error) throw activityResult.error
      setMeals(mealResult.data)
      setActivities(activityResult.data)
      setError(null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the shared schedule.')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (profileLoading) return
    if (!session || !isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    void loadSchedule()
  }, [loadSchedule, profileLoading, session])

  useEffect(() => {
    if (!session || !isSupabaseConfigured) return
    let active = true
    let channel: RealtimeChannel | undefined

    void getSupabaseClient()
      .then((supabase) => {
        if (!active) return
        channel = supabase
          .channel('shared-trip-schedule')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_meals' }, () => {
            void loadSchedule()
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_activities' }, () => {
            void loadSchedule()
          })
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') setError('Live schedule updates could not connect. Refresh to see the latest changes.')
          })
      })
      .catch((channelError: unknown) => {
        if (active) setError(channelError instanceof Error ? channelError.message : 'Could not connect to live schedule updates.')
      })

    return () => {
      active = false
      const activeChannel = channel
      if (activeChannel) void getSupabaseClient().then((supabase) => supabase.removeChannel(activeChannel))
    }
  }, [loadSchedule, session])

  const groupById = useMemo(() => new Map(familyGroups.map((group) => [group.id, group])), [])

  async function saveMeal(meal: MealDraft) {
    setSaving(true)
    setError(null)
    try {
      const supabase = await getSupabaseClient()
      const { error: saveError } = await supabase.from('schedule_meals').upsert({
        id: meal.id,
        day_number: meal.dayNumber,
        meal_type: meal.mealType,
        time_slot: meal.timeSlot,
        title: meal.title.trim(),
        notes: meal.notes.trim(),
        split_mode: meal.splitMode,
        hosted_by_group_id: meal.splitMode === 'single' ? meal.hostedBy : null,
        components: meal.splitMode === 'components' ? (meal.components as Json) : [],
      })
      if (saveError) throw saveError
      await loadSchedule()
      setEditor(null)
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this meal.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveActivity(activity: ActivityDraft) {
    setSaving(true)
    setError(null)
    try {
      const supabase = await getSupabaseClient()
      const values = {
        day_number: activity.dayNumber,
        time_slot: activity.timeSlot.trim(),
        title: activity.title.trim(),
        description: activity.description.trim(),
        location: activity.location.trim(),
        organized_by_group_id: activity.organizedBy,
      }
      const result = activity.id
        ? await supabase.from('schedule_activities').update(values).eq('id', activity.id)
        : await supabase.from('schedule_activities').insert(values)
      if (result.error) throw result.error
      await loadSchedule()
      setEditor(null)
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this activity.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function deleteActivity(id: string) {
    if (!window.confirm('Remove this activity from the shared schedule?')) return
    setSaving(true)
    setError(null)
    try {
      const supabase = await getSupabaseClient()
      const { error: deleteError } = await supabase.from('schedule_activities').delete().eq('id', id)
      if (deleteError) throw deleteError
      await loadSchedule()
      setEditor(null)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not remove this activity.')
    } finally {
      setSaving(false)
    }
  }

  if (!isConfigured) {
    return (
      <>
        <PageHero eyebrow="The reunion plan" title="Trip Schedule" subtitle="Plan the meals, activities, and little moments together." />
        <Notice>Shared scheduling needs the Supabase URL and publishable key configured for this site.</Notice>
      </>
    )
  }

  if (!session && !profileLoading) {
    return (
      <>
        <PageHero eyebrow="The reunion plan" title="Trip Schedule" subtitle="Plan the meals, activities, and little moments together." />
        <section className="mx-auto max-w-xl px-5 pb-24 text-center">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <TybeeIcon icon="groups" size={40} className="mx-auto" />
            <h2 className="mt-4 text-xl font-semibold">Sign in to see the shared schedule</h2>
            <p className="mt-2 mb-5 text-sea/70">Schedule changes are shared with signed-in reunion members.</p>
            <div className="flex justify-center"><AuthButton /></div>
          </div>
        </section>
      </>
    )
  }

  const heading = (
    <PageHero eyebrow="June 10–13, 2027 · Tybee Island" title="Trip Schedule" subtitle="One shared plan for meals, beach days, and time together." />
  )

  return (
    <>
      {heading}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="mb-8 space-y-4 rounded-3xl border border-sea/10 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Choose a view</h2>
              <p className="text-sm text-sea/60">Filter the schedule by meal, activity, or family branch.</p>
            </div>
            <div className="flex flex-wrap gap-1 rounded-2xl bg-sand p-1" aria-label="Schedule view">
              {([
                ['meals', <TybeeIcon icon="food" size={20} />, 'Meals'],
                ['activities', <TybeeIcon icon="calendar" size={20} />, 'Activities'],
                ['combined', <TybeeIcon icon="clock" size={20} />, 'Combined'],
              ] as const).map(([key, icon, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={view === key}
                  onClick={() => setView(key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${
                    view === key ? 'bg-sea text-white shadow-sm' : 'text-sea/70 hover:bg-white'
                  }`}
                >
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2" aria-label="Filter by family group">
            <span className="mr-1 text-sm font-medium text-sea/60">Highlight:</span>
            {groupFilters.map((group) => (
              <button
                key={group.label}
                type="button"
                aria-pressed={filterGroup === group.id}
                onClick={() => setFilterGroup(group.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filterGroup === group.id
                    ? 'bg-sea text-white'
                    : 'bg-sand text-sea/70 hover:bg-shell'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center text-sea/60">Loading the shared schedule…</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {days.map((day) => {
              const dayMeals = meals.filter((meal) => meal.day_number === day.number)
              const dayActivities = activities.filter((activity) => activity.day_number === day.number)
              return (
                <article key={day.number} className="overflow-hidden rounded-3xl border border-sea/10 bg-white shadow-sm">
                  <header className="flex items-center justify-between bg-sea px-5 py-4 text-white">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.15em] text-white/65 uppercase">Day {day.number}</p>
                      <h2 className="font-display text-2xl font-semibold">{day.label}</h2>
                    </div>
                    <TybeeIcon icon="calendar" size={26} className="opacity-80" />
                  </header>
                  <div className="space-y-5 p-5">
                    {view === 'meals' && (
                      <section aria-label={`Day ${day.number} meals`}>
                        <div className="space-y-3">
                          {(['Breakfast', 'Lunch', 'Dinner'] as const).map((mealType) => {
                            const meal = dayMeals.find((item) => item.meal_type === mealType)
                            if (!meal) return null
                            const dimmed = filterGroup !== null && !isAssignedToMeal(meal, filterGroup)
                            return (
                              <div key={meal.id} className={`rounded-2xl border border-sea/10 bg-[#fbfcfc] p-4 transition-opacity ${dimmed ? 'opacity-35' : ''}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-tide uppercase">
                                      <TybeeIcon icon="clock" size={16} /> {formatTime(meal.time_slot || defaultMealTimes[meal.meal_type])} · {meal.meal_type}
                                    </p>
                                    {meal.title ? (
                                      <h3 className="mt-1 font-semibold">{meal.title}</h3>
                                    ) : (
                                      <p className="mt-1 text-sm italic text-sea/45">Meal not planned yet</p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    aria-label={`${meal.title ? 'Edit' : 'Propose or claim'} ${meal.meal_type.toLowerCase()}`}
                                    onClick={() => setEditor({ type: 'meal', meal: toMealDraft(meal) })}
                                    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-sea/65 hover:bg-sand hover:text-sea"
                                  >
                                    {meal.title ? <><Pencil size={13} /> Edit</> : <><Plus size={14} /> Propose / Claim</>}
                                  </button>
                                </div>
                                {meal.title && (
                                  <>
                                    {meal.split_mode === 'single' ? (
                                      <GroupBadge groupId={meal.hosted_by_group_id} groupById={groupById} prefix="Hosted by" />
                                    ) : (
                                      <div className="mt-3 space-y-2">
                                        {readComponents(meal.components).map((component) => (
                                          <div key={component.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-sea/5 pt-2 text-sm">
                                            <span className="text-sea/75">{component.label}</span>
                                            {component.claimedBy ? (
                                              <GroupBadge groupId={component.claimedBy} groupById={groupById} />
                                            ) : (
                                              <button type="button" onClick={() => setEditor({ type: 'meal', meal: toMealDraft(meal) })} className="rounded-full bg-sand px-2.5 py-1 text-xs text-sea/65 hover:bg-shell">+ Claim slot</button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {meal.notes && <p className="mt-3 text-sm leading-relaxed text-sea/65">{meal.notes}</p>}
                                  </>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    )}

                    {view === 'activities' && (
                      <section aria-label={`Day ${day.number} activities`}>
                        <div className="space-y-3">
                          {dayActivities.length === 0 && (
                            <p className="rounded-2xl border border-dashed border-sea/15 px-4 py-5 text-center text-sm text-sea/50">Nothing planned yet. Add an activity to get started.</p>
                          )}
                          {dayActivities.map((activity) => {
                            const dimmed = filterGroup !== null && activity.organized_by_group_id !== filterGroup
                            return (
                              <div key={activity.id} className={`rounded-2xl border border-tide/20 bg-tide/5 p-4 transition-opacity ${dimmed ? 'opacity-35' : ''}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className="font-semibold">{activity.title}</h3>
                                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-sea/60">
                                      {activity.time_slot && <span className="inline-flex items-center gap-1"><TybeeIcon icon="clock" size={16} />{activity.time_slot}</span>}
                                      {activity.location && <span className="inline-flex items-center gap-1"><MapPin size={13} />{activity.location}</span>}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    aria-label={`Edit ${activity.title}`}
                                    onClick={() => setEditor({ type: 'activity', activity: {
                                      id: activity.id,
                                      dayNumber: activity.day_number,
                                      timeSlot: activity.time_slot,
                                      title: activity.title,
                                      description: activity.description,
                                      location: activity.location,
                                      organizedBy: activity.organized_by_group_id as GroupId | null,
                                    } })}
                                    className="rounded-lg p-1.5 text-sea/55 hover:bg-white hover:text-sea"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                </div>
                                {activity.description && <p className="mt-3 text-sm leading-relaxed text-sea/70">{activity.description}</p>}
                                <GroupBadge groupId={activity.organized_by_group_id} groupById={groupById} prefix="Organized by" />
                              </div>
                            )
                          })}
                          <button
                            type="button"
                            onClick={() => setEditor({ type: 'activity', activity: {
                              dayNumber: day.number,
                              timeSlot: '',
                              title: '',
                              description: '',
                              location: '',
                              organizedBy: null,
                            } })}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sea/20 px-4 py-3 text-sm font-semibold text-sea/65 transition hover:border-sea/40 hover:bg-sand"
                          >
                            <Plus size={16} /> Add activity
                          </button>
                        </div>
                      </section>
                    )}

                    {view === 'combined' && (
                      <section aria-label={`Day ${day.number} combined timeline`}>
                        <SectionLabel icon={<TybeeIcon icon="clock" size={18} />} label="Combined timeline" />
                        <div className="space-y-2">
                          {buildTimeline(dayMeals, dayActivities).map((item) => {
                            const isMeal = item.kind === 'meal'
                            const dimmed = filterGroup !== null && (
                              isMeal
                                ? !isAssignedToMeal(item.meal, filterGroup)
                                : item.activity.organized_by_group_id !== filterGroup
                            )
                            const time = isMeal
                              ? formatTime(item.meal.time_slot || defaultMealTimes[item.meal.meal_type])
                              : item.activity.time_slot || 'Time TBD'
                            return (
                              <div key={isMeal ? item.meal.id : item.activity.id} className={`flex gap-3 rounded-2xl border p-3 transition-opacity ${isMeal ? 'border-sea/10 bg-[#fbfcfc]' : 'border-tide/20 bg-tide/5'} ${dimmed ? 'opacity-35' : ''}`}>
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isMeal ? 'bg-sand text-coral' : 'bg-tide/10 text-tide'}`}>
                                  {isMeal ? <TybeeIcon icon="food" size={20} /> : <TybeeIcon icon="calendar" size={20} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-sea/50">{time}{isMeal && ` · ${item.meal.meal_type}`}</p>
                                  <h3 className="mt-0.5 font-semibold">{isMeal ? item.meal.title || `${item.meal.meal_type} · not planned` : item.activity.title}</h3>
                                  {isMeal ? (
                                    item.meal.split_mode === 'single' ? (
                                      <GroupBadge groupId={item.meal.hosted_by_group_id} groupById={groupById} prefix="Hosted by" />
                                    ) : (
                                      <p className="mt-1 text-xs text-sea/55">{readComponents(item.meal.components).map((component) => `${component.label}${component.claimedBy ? ` — ${groupShortNames[component.claimedBy]}` : ' — open'}`).join(' · ')}</p>
                                    )
                                  ) : (
                                    <>
                                      {(item.activity.location || item.activity.description) && (
                                        <p className="mt-1 text-sm text-sea/60">{[item.activity.location, item.activity.description].filter(Boolean).join(' · ')}</p>
                                      )}
                                      <GroupBadge groupId={item.activity.organized_by_group_id} groupById={groupById} prefix="Organized by" />
                                    </>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  aria-label={`Edit ${isMeal ? item.meal.meal_type : item.activity.title}`}
                                  onClick={() => isMeal
                                    ? setEditor({ type: 'meal', meal: toMealDraft(item.meal) })
                                    : setEditor({ type: 'activity', activity: {
                                      id: item.activity.id,
                                      dayNumber: item.activity.day_number,
                                      timeSlot: item.activity.time_slot,
                                      title: item.activity.title,
                                      description: item.activity.description,
                                      location: item.activity.location,
                                      organizedBy: item.activity.organized_by_group_id as GroupId | null,
                                    } })}
                                  className="h-fit rounded-lg p-1.5 text-sea/45 hover:bg-white hover:text-sea"
                                >
                                  <Pencil size={14} />
                                </button>
                              </div>
                            )
                          })}
                          <button
                            type="button"
                            onClick={() => setEditor({ type: 'activity', activity: {
                              dayNumber: day.number,
                              timeSlot: '',
                              title: '',
                              description: '',
                              location: '',
                              organizedBy: null,
                            } })}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sea/20 px-4 py-3 text-sm font-semibold text-sea/65 transition hover:border-sea/40 hover:bg-sand"
                          >
                            <Plus size={16} /> Add activity
                          </button>
                        </div>
                      </section>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
      {editor?.type === 'meal' && (
        <MealEditor
          meal={editor.meal}
          saving={saving}
          onClose={() => setEditor(null)}
          onSave={saveMeal}
        />
      )}
      {editor?.type === 'activity' && (
        <ActivityEditor
          activity={editor.activity}
          saving={saving}
          onClose={() => setEditor(null)}
          onSave={saveActivity}
          onDelete={editor.activity.id ? deleteActivity.bind(null, editor.activity.id) : undefined}
        />
      )}
      {profile && <span className="sr-only">Signed in as {profile.full_name}</span>}
    </>
  )
}

function SectionLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return <h3 className="mb-3 flex items-center gap-2 border-b border-sea/10 pb-2 text-xs font-bold tracking-[0.14em] text-sea/55 uppercase">{icon}{label}</h3>
}

function GroupBadge({
  groupId,
  groupById,
  prefix,
}: {
  groupId: number | null
  groupById: Map<number, (typeof familyGroups)[number]>
  prefix?: string
}) {
  const group = groupId === null ? undefined : groupById.get(groupId as GroupId)
  return (
    <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-sea/55">
      {prefix && <>{prefix}:</>}
      {group ? (
        <span className={`rounded-full px-2.5 py-1 font-semibold ring-1 ring-inset ${groupBadgeClasses[group.id]}`}>
          {groupShortNames[group.id]}
        </span>
      ) : (
        <span className="rounded-full bg-sand px-2.5 py-1 font-medium text-sea/55">Everyone / unassigned</span>
      )}
    </span>
  )
}

function Notice({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-xl px-5 pb-24"><p role="alert" className="rounded-2xl bg-white p-6 text-center text-sea/70 shadow-sm">{children}</p></section>
}

function EditorShell({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-sea/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="schedule-editor-title" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-7">
        <header className="mb-5 flex items-start justify-between gap-4">
          <h2 id="schedule-editor-title" className="font-display text-2xl font-semibold">{title}</h2>
          <button type="button" aria-label="Close editor" onClick={onClose} className="rounded-full p-2 text-sea/55 hover:bg-sand hover:text-sea"><X size={20} /></button>
        </header>
        {children}
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-semibold text-sea/80">{label}<span className="mt-1.5 block">{children}</span></label>
}

const inputClass =
  'w-full rounded-xl border border-sea/15 bg-white px-3.5 py-2.5 text-sm font-normal text-sea outline-none transition placeholder:text-sea/35 focus:border-tide focus:ring-2 focus:ring-tide/15'

function GroupSelect({
  value,
  onChange,
  everyoneLabel = 'Everyone / unassigned',
}: {
  value: GroupId | null
  onChange: (value: GroupId | null) => void
  everyoneLabel?: string
}) {
  return (
    <select className={inputClass} value={value ?? ''} onChange={(event) => onChange(event.target.value ? Number(event.target.value) as GroupId : null)}>
      <option value="">{everyoneLabel}</option>
      {familyGroups.map((group) => <option key={group.id} value={group.id}>{groupShortNames[group.id]} family</option>)}
    </select>
  )
}

function MealEditor({
  meal,
  saving,
  onClose,
  onSave,
}: {
  meal: MealDraft
  saving: boolean
  onClose: () => void
  onSave: (meal: MealDraft) => Promise<boolean>
}) {
  const [draft, setDraft] = useState(meal)
  const [componentLabel, setComponentLabel] = useState('')
  const day = days.find((item) => item.number === meal.dayNumber)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSave(draft)
  }

  function addComponent() {
    const label = componentLabel.trim()
    if (!label) return
    setDraft((current) => ({
      ...current,
      components: [...current.components, { id: crypto.randomUUID(), label, claimedBy: null }],
    }))
    setComponentLabel('')
  }

  return (
    <EditorShell title={`${meal.title ? 'Edit' : 'Propose'} ${meal.mealType}`} onClose={onClose}>
      <p className="mb-5 text-sm text-sea/55">Day {meal.dayNumber} · {day?.label}</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Meal title">
          <input className={inputClass} autoFocus required maxLength={120} placeholder="e.g. Taco bar" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        </Field>
        <Field label="Meal time">
          <input
            className={inputClass}
            type="time"
            required
            value={draft.timeSlot}
            onChange={(event) => setDraft({ ...draft, timeSlot: event.target.value })}
          />
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-sea/80">How should this meal be hosted?</legend>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['single', 'Single group host'],
              ['components', 'Split into components'],
            ] as const).map(([mode, label]) => (
              <button key={mode} type="button" aria-pressed={draft.splitMode === mode} onClick={() => setDraft({ ...draft, splitMode: mode })} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${draft.splitMode === mode ? 'border-tide bg-tide/10 text-sea' : 'border-sea/15 text-sea/60 hover:bg-sand'}`}>
                {draft.splitMode === mode && <Check className="mr-1 inline" size={14} />}{label}
              </button>
            ))}
          </div>
        </fieldset>
        {draft.splitMode === 'single' ? (
          <Field label="Hosted by">
            <GroupSelect value={draft.hostedBy} onChange={(hostedBy) => setDraft({ ...draft, hostedBy })} />
          </Field>
        ) : (
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-sea/80">Meal components and group claims</legend>
            {draft.components.map((component) => (
              <div key={component.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2">
                <input className={inputClass} aria-label="Component name" value={component.label} onChange={(event) => setDraft({ ...draft, components: draft.components.map((item) => item.id === component.id ? { ...item, label: event.target.value } : item) })} />
                <GroupSelect value={component.claimedBy} onChange={(claimedBy) => setDraft({ ...draft, components: draft.components.map((item) => item.id === component.id ? { ...item, claimedBy } : item) })} />
                <button type="button" aria-label={`Remove ${component.label}`} onClick={() => setDraft({ ...draft, components: draft.components.filter((item) => item.id !== component.id) })} className="rounded-lg p-2 text-sea/45 hover:bg-rose-50 hover:text-rose-700"><X size={16} /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input className={inputClass} aria-label="New component name" placeholder="Main course, sides, dessert…" value={componentLabel} onChange={(event) => setComponentLabel(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addComponent() } }} />
              <button type="button" onClick={addComponent} disabled={!componentLabel.trim()} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-sand px-3 text-sm font-semibold text-sea disabled:opacity-40"><Plus size={15} /> Add</button>
            </div>
          </fieldset>
        )}
        <Field label="Notes (dietary needs, prep instructions)">
          <textarea className={`${inputClass} min-h-24 resize-y`} maxLength={1500} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-sea/65 hover:bg-sand">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-sea px-5 py-2.5 text-sm font-semibold text-white hover:bg-sea-deep disabled:opacity-60">{saving ? 'Saving…' : 'Save meal'}</button>
        </div>
      </form>
    </EditorShell>
  )
}

function ActivityEditor({
  activity,
  saving,
  onClose,
  onSave,
  onDelete,
}: {
  activity: ActivityDraft
  saving: boolean
  onClose: () => void
  onSave: (activity: ActivityDraft) => Promise<boolean>
  onDelete?: () => Promise<void>
}) {
  const [draft, setDraft] = useState(activity)
  const day = days.find((item) => item.number === activity.dayNumber)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSave(draft)
  }

  return (
    <EditorShell title={activity.id ? 'Edit activity' : 'Add activity'} onClose={onClose}>
      <p className="mb-5 text-sm text-sea/55">Day {activity.dayNumber} · {day?.label}</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Activity title">
          <input className={inputClass} autoFocus required maxLength={120} placeholder="e.g. Kayaking at the lake" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Time or timeframe">
            <input className={inputClass} maxLength={40} placeholder="e.g. 10:00 AM or Afternoon" value={draft.timeSlot} onChange={(event) => setDraft({ ...draft, timeSlot: event.target.value })} />
          </Field>
          <Field label="Location">
            <input className={inputClass} maxLength={120} placeholder="e.g. Back River" value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
          </Field>
        </div>
        <Field label="Lead organizer">
          <GroupSelect value={draft.organizedBy} onChange={(organizedBy) => setDraft({ ...draft, organizedBy })} everyoneLabel="Everyone" />
        </Field>
        <Field label="Description and details">
          <textarea className={`${inputClass} min-h-24 resize-y`} maxLength={1500} placeholder="Add helpful details for the group…" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </Field>
        <div className="flex justify-between gap-2 pt-2">
          {onDelete ? (
            <button type="button" disabled={saving} onClick={() => void onDelete()} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Remove</button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-sea/65 hover:bg-sand">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-sea px-5 py-2.5 text-sm font-semibold text-white hover:bg-sea-deep disabled:opacity-60">{saving ? 'Saving…' : 'Save activity'}</button>
          </div>
        </div>
      </form>
    </EditorShell>
  )
}
