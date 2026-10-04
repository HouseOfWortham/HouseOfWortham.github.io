import {
  getSupabaseClient,
  type MemberProfile,
  type MemberTravelDetails,
  type TravelStatus,
} from '@/lib/supabase'

export type MemberDetails = {
  profile: MemberProfile | null
  travel: MemberTravelDetails | null
}

export type MemberDetailsInput = {
  userId: string
  fullName: string
  avatarUrl: string
  familyGroupId: number
  status: TravelStatus
  travelMode: string
  flightInfo: string
  arrival: string
  lodgingName: string
  lodgingAddress: string
  notes: string
}

export async function loadMemberDetails(userId: string): Promise<MemberDetails> {
  const supabase = await getSupabaseClient()
  const [profileResult, travelResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, family_group_id, updated_at')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('travel_details')
      .select('user_id, status, travel_mode, flight_info, arrival, lodging_name, lodging_address, notes, updated_at')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  if (profileResult.error) throw profileResult.error
  if (travelResult.error) throw travelResult.error

  return { profile: profileResult.data, travel: travelResult.data }
}

export async function saveMemberDetails(input: MemberDetailsInput) {
  const supabase = await getSupabaseClient()
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: input.userId,
    full_name: input.fullName,
    avatar_url: input.avatarUrl || null,
    family_group_id: input.familyGroupId,
  })
  if (profileError) throw profileError

  const { error: travelError } = await supabase.from('travel_details').upsert({
    user_id: input.userId,
    status: input.status,
    travel_mode: input.travelMode,
    flight_info: input.flightInfo,
    arrival: input.arrival,
    lodging_name: input.lodgingName,
    lodging_address: input.lodgingAddress,
    notes: input.notes,
  })
  if (travelError) throw travelError
}
