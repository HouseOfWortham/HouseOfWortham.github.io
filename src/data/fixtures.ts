// Sample data for the first milestone. Every screen reads from this module so
// a later milestone can swap these exports for real database queries.

export const REUNION = {
  name: 'Tybee Tides',
  title: 'The Family Reunion on Tybee Island',
  location: 'Tybee Island, Georgia',
  startDate: '2027-06-18',
  endDate: '2027-06-22',
  dateLabel: 'June 18 – 22, 2027',
  nearestAirport: 'Savannah/Hilton Head International (SAV)',
}

export function cdn(path: string, width: number) {
  return `/.netlify/images?url=${encodeURIComponent(path)}&w=${width}&fm=webp`
}

export const IMAGES = {
  hero: '/img/hero.png',
  lighthouse: '/img/lighthouse.png',
  family: '/img/family.png',
  dolphins: '/img/dolphins.png',
}

export type FamilyGroup = {
  id: number
  groupName: string
  homeBase: string
  color: string
  members: number
}

export const familyGroups: FamilyGroup[] = [
  { id: 1, groupName: 'The Smith Branch', homeBase: 'Atlanta, GA', color: '#ff7a59', members: 14 },
  { id: 2, groupName: 'The Davis Branch', homeBase: 'Charlotte, NC', color: '#1f9e9a', members: 11 },
  { id: 3, groupName: 'The West Coast Crew', homeBase: 'Oakland, CA', color: '#f2b544', members: 8 },
  { id: 4, groupName: 'The Lowcountry Locals', homeBase: 'Savannah, GA', color: '#3d6fb6', members: 9 },
]

export type Activity = {
  id: number
  name: string
  description: string
  image: string
  when: string
  // Seed community ratings: counts for 1..5 stars.
  ratingCounts: [number, number, number, number, number]
}

export const activities: Activity[] = [
  {
    id: 1,
    name: 'Sunrise Lighthouse Climb',
    description: 'All 178 steps of the Tybee Light Station, then coffee and biscuits on the keeper’s porch.',
    image: IMAGES.lighthouse,
    when: 'Saturday morning',
    ratingCounts: [1, 2, 5, 11, 9],
  },
  {
    id: 2,
    name: 'Dolphin Tour on the Back River',
    description: 'A 90-minute boat cruise through the salt marsh — kids almost always spot a pod.',
    image: IMAGES.dolphins,
    when: 'Friday afternoon',
    ratingCounts: [0, 1, 3, 9, 16],
  },
  {
    id: 3,
    name: 'Lowcountry Boil on the Beach',
    description: 'Shrimp, corn, sausage and potatoes poured on the table, with a sunset at our backs.',
    image: IMAGES.family,
    when: 'Saturday evening',
    ratingCounts: [0, 0, 2, 6, 22],
  },
  {
    id: 4,
    name: 'Sandcastle Showdown',
    description: 'Branch vs. branch. Buckets provided, judging by the grandparents. Bragging rights forever.',
    image: IMAGES.hero,
    when: 'Sunday midday',
    ratingCounts: [2, 3, 7, 8, 6],
  },
  {
    id: 5,
    name: 'Day Trip to Historic Savannah',
    description: 'Forsyth Park, River Street pralines, and a trolley through the squares — 25 minutes away.',
    image: IMAGES.hero,
    when: 'Monday',
    ratingCounts: [3, 4, 8, 6, 4],
  },
  {
    id: 6,
    name: 'Family Talent & Story Night',
    description: 'Songs, skits, and the stories the elders only tell once a year. Bring your best.',
    image: IMAGES.family,
    when: 'Sunday night',
    ratingCounts: [1, 1, 4, 10, 12],
  },
]

export type TravelSummary = {
  familyGroupId: number
  flight: string
  arrival: string
  lodging: string
  lodgingAddress: string
  confirmed: number
  pending: number
}

export const travelByGroup: TravelSummary[] = [
  {
    familyGroupId: 1,
    flight: 'Delta DL 1187 · ATL → SAV',
    arrival: 'Thu, Jun 17 · 2:45 PM',
    lodging: 'The Sea Oats House (6BR)',
    lodgingAddress: '14 Butler Ave, Tybee Island',
    confirmed: 10,
    pending: 4,
  },
  {
    familyGroupId: 2,
    flight: 'Driving · I-95 South (~4h 30m)',
    arrival: 'Fri, Jun 18 · Noon',
    lodging: 'Pelican Point Cottages (3 units)',
    lodgingAddress: '1501 Strand Ave, Tybee Island',
    confirmed: 7,
    pending: 4,
  },
  {
    familyGroupId: 3,
    flight: 'United UA 2214 · OAK → IAH → SAV',
    arrival: 'Thu, Jun 17 · 9:10 PM',
    lodging: 'Tybee Beach Bungalow',
    lodgingAddress: '7 17th Place, Tybee Island',
    confirmed: 5,
    pending: 3,
  },
  {
    familyGroupId: 4,
    flight: 'Local · 25 min drive',
    arrival: 'Fri, Jun 18 · Morning',
    lodging: 'Staying home & day-tripping',
    lodgingAddress: 'Savannah, GA',
    confirmed: 9,
    pending: 0,
  },
]

export const faqs: { q: string; a: string }[] = [
  {
    q: 'Which airport should I fly into?',
    a: 'Savannah/Hilton Head International (SAV) is about 35 minutes from Tybee. Jacksonville (JAX) is a 2-hour drive if fares are much cheaper.',
  },
  {
    q: 'Do I need a car on the island?',
    a: 'Not really. Tybee is about 3 miles long and very bikeable. We’ll organize airport carpools — just add your flight in your travel details.',
  },
  {
    q: 'Where do I park?',
    a: 'Most rentals include parking. Public beach lots use the Park Tybee app; budget about $3/hour in summer.',
  },
  {
    q: 'What should I pack?',
    a: 'Sunscreen, bug spray for the marsh at dusk, a light rain jacket for afternoon storms, and your matching reunion T-shirt.',
  },
  {
    q: 'I haven’t booked yet — is that OK?',
    a: 'Absolutely. Mark yourself as “not booked yet” and we’ll share any spare rooms within your branch’s rentals first.',
  },
]

export function averageRating(counts: number[]) {
  const total = counts.reduce((a, b) => a + b, 0)
  if (!total) return 0
  return counts.reduce((sum, c, i) => sum + c * (i + 1), 0) / total
}
