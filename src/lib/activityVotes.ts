import { activities } from '@/data/fixtures'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export type ActivityVoteData = {
  counts: Record<number, number[]>
  myVotes: Record<number, number>
}

function emptyCounts() {
  return Object.fromEntries(activities.map(({ id }) => [id, [0, 0, 0, 0, 0]]))
}

export async function loadActivityVotes(userId: string | null): Promise<ActivityVoteData> {
  if (!isSupabaseConfigured) {
    throw new Error('Shared voting is not configured. Add the Supabase URL and publishable key.')
  }

  const supabase = await getSupabaseClient()
  const { data: aggregateRows, error: aggregateError } = await supabase.rpc('get_activity_vote_counts')
  if (aggregateError) throw aggregateError

  const counts = emptyCounts()
  for (const row of aggregateRows) {
    const activityCounts = counts[row.activity_id]
    if (activityCounts && row.rating >= 1 && row.rating <= 5) {
      activityCounts[row.rating - 1] = Number(row.vote_count)
    }
  }

  const myVotes: Record<number, number> = {}
  if (userId) {
    const { data, error } = await supabase
      .from('activity_votes')
      .select('activity_id, rating')
      .eq('user_id', userId)
    if (error) throw error

    for (const vote of data) myVotes[vote.activity_id] = vote.rating
  }

  return { counts, myVotes }
}

export async function saveActivityVote(userId: string, activityId: number, rating: number) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Choose a rating from 1 to 5 stars.')
  }
  if (!activities.some(({ id }) => id === activityId)) {
    throw new Error('That activity is not available for voting.')
  }

  const supabase = await getSupabaseClient()
  const { error } = await supabase.from('activity_votes').upsert(
    { user_id: userId, activity_id: activityId, rating },
    { onConflict: 'user_id,activity_id' },
  )
  if (error) throw error
}
