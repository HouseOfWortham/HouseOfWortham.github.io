import type { SupabaseClient } from '@supabase/supabase-js'

type ProfileRow = {
  id: string
  full_name: string
  avatar_url: string | null
  family_group_id: number
  updated_at: string
}

type TravelDetailsRow = {
  user_id: string
  status: 'confirmed' | 'pending' | 'not_booked'
  travel_mode: string
  flight_info: string
  arrival: string
  lodging_name: string
  lodging_address: string
  notes: string
  updated_at: string
}

type FamilyGroupRow = {
  id: number
  name: string
  home_base: string
  color: string
}

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Omit<ProfileRow, 'updated_at'> & { updated_at?: string }
      >
      travel_details: Table<
        TravelDetailsRow,
        Omit<TravelDetailsRow, 'updated_at'> & { updated_at?: string }
      >
      family_groups: Table<FamilyGroupRow, FamilyGroupRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export type MemberProfile = ProfileRow
export type MemberTravelDetails = TravelDetailsRow
export type TravelStatus = TravelDetailsRow['status']

let client: Promise<SupabaseClient<Database>> | null = null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export function getSupabaseClient(): Promise<SupabaseClient<Database>> {
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
