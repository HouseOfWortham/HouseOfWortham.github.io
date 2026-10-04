import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

let client: Promise<SupabaseClient> | null = null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export function getSupabaseClient(): Promise<SupabaseClient> {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable Google sign-in.',
    )
  }

  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(supabaseUrl, supabasePublishableKey),
  )
  return client
}
