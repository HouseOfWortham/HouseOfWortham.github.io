import { useCallback, useEffect, useRef, useState } from 'react'
import { activities } from '@/data/fixtures'
import { loadActivityVotes, type ActivityVoteData } from '@/lib/activityVotes'

function emptyVoteData(): ActivityVoteData {
  return {
    counts: Object.fromEntries(activities.map(({ id }) => [id, [0, 0, 0, 0, 0]])),
    myVotes: {},
  }
}

export function useActivityVotes(userId: string | null) {
  const [voteData, setVoteData] = useState<ActivityVoteData>(emptyVoteData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)
  const currentUserId = useRef(userId)
  currentUserId.current = userId

  const refresh = useCallback(async () => {
    const thisRequest = ++requestId.current
    try {
      const next = await loadActivityVotes(userId)
      if (requestId.current !== thisRequest || currentUserId.current !== userId) return
      setVoteData(next)
      setError(null)
    } catch (loadError) {
      if (requestId.current !== thisRequest || currentUserId.current !== userId) return
      setError(loadError instanceof Error ? loadError.message : 'Could not load shared votes.')
    } finally {
      if (requestId.current === thisRequest && currentUserId.current === userId) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    setLoading(true)
    void refresh()

    const onFocus = () => void refresh()
    window.addEventListener('focus', onFocus)
    const interval = window.setInterval(() => void refresh(), 30_000)

    return () => {
      requestId.current += 1
      window.removeEventListener('focus', onFocus)
      window.clearInterval(interval)
    }
  }, [refresh])

  return { ...voteData, loading, error, refresh }
}
