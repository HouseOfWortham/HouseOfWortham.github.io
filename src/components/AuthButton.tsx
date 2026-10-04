import { Link } from '@tanstack/react-router'
import { GoogleG } from '@/components/GoogleG'
import { useAuth } from '@/components/AuthProvider'

const buttonClassName =
  'ml-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-sea shadow transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70'

export function AuthButton({ className = buttonClassName }: { className?: string }) {
  const { session, profile, isConfigured, isBusy, error, signInWithGoogle, signOut } = useAuth()

  return (
    <div>
      {session ? (
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/profile" className={className}>
            {profile?.full_name || session.user.user_metadata.full_name || 'Profile'}
          </Link>
          <button type="button" onClick={signOut} disabled={isBusy} className={className}>
            {isBusy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={!isConfigured || isBusy}
          title={isConfigured ? 'Sign in with Google' : 'Configure Supabase to enable sign-in'}
          className={className}
        >
          <GoogleG /> {isBusy ? 'Connecting…' : 'Sign in with Google'}
        </button>
      )}
      {!isConfigured && (
        <p role="status" className="mt-2 max-w-xs rounded-lg bg-sea/90 px-2 py-1 text-xs text-white">
          Add the Supabase URL and publishable key to enable sign-in.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 max-w-xs rounded-lg bg-sea/90 px-2 py-1 text-xs text-white">
          Google sign-in failed: {error}
        </p>
      )}
    </div>
  )
}
