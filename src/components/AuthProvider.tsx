import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

type AuthContextValue = {
  session: Session | null
  isConfigured: boolean
  isBusy: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let active = true
    let unsubscribe: (() => void) | undefined

    void getSupabaseClient()
      .then((supabase) => {
        if (!active) return
        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          setSession(nextSession)
          setError(null)
        })
        unsubscribe = () => data.subscription.unsubscribe()
      })
      .catch((authError: unknown) => {
        if (active) setError(errorMessage(authError))
      })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setIsBusy(true)
    setError(null)

    try {
      const redirectTo = new URL(import.meta.env.BASE_URL, window.location.origin).toString()
      const supabase = await getSupabaseClient()
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (authError) throw authError
    } catch (authError) {
      setError(errorMessage(authError))
    } finally {
      setIsBusy(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsBusy(true)
    setError(null)

    try {
      const supabase = await getSupabaseClient()
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
    } catch (authError) {
      setError(errorMessage(authError))
    } finally {
      setIsBusy(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, isConfigured: isSupabaseConfigured, isBusy, error, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
