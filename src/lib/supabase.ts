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

type ActivityVoteRow = {
  user_id: string
  activity_id: number
  rating: number
  updated_at: string
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ScheduleMealRow = {
  id: string
  day_number: number
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner'
  time_slot: string
  title: string | null
  notes: string
  split_mode: 'single' | 'components'
  hosted_by_group_id: number | null
  components: Json
  updated_at: string
}

export type ScheduleActivityRow = {
  id: string
  day_number: number
  time_slot: string
  title: string
  description: string
  location: string
  organized_by_group_id: number | null
  updated_at: string
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
      activity_votes: Table<
        ActivityVoteRow,
        Omit<ActivityVoteRow, 'updated_at'> & { updated_at?: string }
      >
      schedule_meals: Table<
        ScheduleMealRow,
        Omit<ScheduleMealRow, 'id' | 'updated_at'> & { id?: string; updated_at?: string }
      >
      schedule_activities: Table<
        ScheduleActivityRow,
        Omit<ScheduleActivityRow, 'id' | 'updated_at'> & { id?: string; updated_at?: string }
      >
    }
    Views: Record<string, never>
    Functions: {
      get_activity_vote_counts: {
        Args: Record<string, never>
        Returns: { activity_id: number; rating: number; vote_count: number }[]
      }
      get_family_travel_summaries: {
        Args: Record<string, never>
        Returns: {
          family_group_id: number
          travel_mode: string
          status: string
          member_count: number
        }[]
      }
    }
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
