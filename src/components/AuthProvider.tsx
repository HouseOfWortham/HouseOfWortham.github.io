import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { loadMemberDetails } from '@/lib/memberProfile'
import type { MemberProfile, MemberTravelDetails } from '@/lib/supabase'

type AuthContextValue = {
  session: Session | null
  isConfigured: boolean
  isBusy: boolean
  profileLoading: boolean
  profile: MemberProfile | null
  travel: MemberTravelDetails | null
  error: string | null
  refreshProfile: () => Promise<void>
  clearError: () => void
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const sessionRef = useRef<Session | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [travel, setTravel] = useState<MemberTravelDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let active = true
    let unsubscribe: (() => void) | undefined

    void getSupabaseClient()
      .then((supabase) => {
        if (!active) return
        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          const userChanged = sessionRef.current?.user.id !== nextSession?.user.id
          sessionRef.current = nextSession
          setSession(nextSession)
          if (userChanged) {
            setProfile(null)
            setTravel(null)
            setProfileLoading(Boolean(nextSession))
            if (!nextSession) setError(null)
          }
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

  const refreshProfile = useCallback(async () => {
    if (!session) {
      setProfile(null)
      setTravel(null)
      return
    }

    setProfileLoading(true)
    try {
      const userId = session.user.id
      const details = await loadMemberDetails(userId)
      if (sessionRef.current?.user.id !== userId) return
      setProfile(details.profile)
      setTravel(details.travel)
    } catch (profileError) {
      if (sessionRef.current?.user.id === session.user.id) setError(errorMessage(profileError))
    } finally {
      if (sessionRef.current?.user.id === session.user.id) setProfileLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (!session) {
      setProfileLoading(false)
      return
    }

    void refreshProfile()
  }, [refreshProfile, session])

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

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider
      value={{
        session,
        isConfigured: isSupabaseConfigured,
        isBusy,
        profileLoading,
        profile,
        travel,
        error,
        refreshProfile,
        clearError,
        signInWithGoogle,
        signOut,
      }}
    >
      <OnboardingRedirect />
      {children}
    </AuthContext.Provider>
  )
}

function OnboardingRedirect() {
  const { session, profile, travel, profileLoading } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  useEffect(() => {
    if (!session || profileLoading || (profile && travel) || pathname.replace(/\/+$/, '').endsWith('/profile')) return
    void navigate({ to: '/profile' })
  }, [navigate, pathname, profile, profileLoading, session, travel])

  return null
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
