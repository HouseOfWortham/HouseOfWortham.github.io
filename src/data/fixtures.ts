// Sample data for the first milestone. Every screen reads from this module so
// a later milestone can swap these exports for real database queries.

export const REUNION = {
  name: 'Tybee Tides',
  title: 'The Hambelton Family Reunion on Tybee Island',
  location: 'Tybee Island, Georgia',
  startDate: '2027-06-10',
  endDate: '2027-06-13',
  dateLabel: 'June 10 – 13, 2027',
  nearestAirport: 'Savannah/Hilton Head International (SAV)',
}

export function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export const IMAGES = {
  hero: '/img/hero.png',
  lighthouse: '/img/lighthouse.png',
  logo: '/img/Tybee_LightHouse.png',
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
  { id: 1, groupName: 'The Hambelton Homestead', homeBase: 'Boise, ID', color: '#ff7a59', members: 2 },
  { id: 2, groupName: 'The Badger Borough', homeBase: 'Boise, ID', color: '#1f9e9a', members: 8 },
  { id: 3, groupName: 'The Treasure Valley Hunts', homeBase: 'Boise, ID', color: '#f2b544', members: 5 },
  { id: 4, groupName: 'The Marevelous McBrides', homeBase: 'Richmond, VA', color: '#3d6fb6', members: 3 },
  { id: 5, groupName: 'The Wortham Wing', homeBase: 'Charlotte, NC', color: '#903db6', members: 9 },
]

export type Activity = {
  id: number
  name: string
  description: string
  image: string
  when: string
}

export const activities: Activity[] = [
  {
    id: 1,
    name: 'Sunrise Lighthouse Climb',
    description: 'All 178 steps of the Tybee Light Station, then coffee and biscuits on the keeper’s porch.',
    image: IMAGES.lighthouse,
    when: 'Saturday morning',
  },
  {
    id: 2,
    name: 'Dolphin Tour on the Back River',
    description: 'A 90-minute boat cruise through the salt marsh — kids almost always spot a pod.',
    image: IMAGES.dolphins,
    when: 'Friday afternoon',
  },
  {
    id: 3,
    name: 'Lowcountry Boil on the Beach',
    description: 'Shrimp, corn, sausage and potatoes poured on the table, with a sunset at our backs.',
    image: IMAGES.family,
    when: 'Saturday evening',
  },
  {
    id: 4,
    name: 'Sandcastle Showdown',
    description: 'Branch vs. branch. Buckets provided, judging by the grandparents. Bragging rights forever.',
    image: IMAGES.hero,
    when: 'Sunday midday',
  },
  {
    id: 5,
    name: 'Day Trip to Historic Savannah',
    description: 'Forsyth Park, River Street pralines, and a trolley through the squares — 25 minutes away.',
    image: IMAGES.hero,
    when: 'Monday',
  },
  {
    id: 6,
    name: 'Family Talent & Story Night',
    description: 'Songs, skits, and the stories the elders only tell once a year. Bring your best.',
    image: IMAGES.family,
    when: 'Sunday night',
  },
]

export const faqs: { q: string; a: string }[] = [
  {
    q: 'Which airport should I fly into?',
    a: 'Savannah/Hilton Head International (SAV) is about 35 minutes from Tybee. Jacksonville (JAX) is a 2-hour drive if fares are much cheaper.',
  },
  {
    q: 'Do I need a car on the island?',
    a: 'Not really. Tybee is about 3 miles long and very bikeable. Add your travel method and arrival details to your profile, then coordinate an airport ride with family. Individual flight details are visible only to you.',
  },
  {
    q: 'Where do I park?',
    a: 'Check the shared VRBO listing for the rental’s parking details. Public beach lots use the Park Tybee app; budget about $3/hour in summer.',
  },
  {
    q: 'What should I pack?',
    a: 'Sunscreen, bug spray for the marsh at dusk, a light rain jacket for afternoon storms, and your matching reunion T-shirt.',
  },
  {
    q: 'I haven’t booked yet — is that OK?',
    a: 'Absolutely. Mark yourself as “not booked yet” in your profile. The family is sharing one VRBO, so please coordinate booking and room details with the reunion organizer.',
  },
]

export function averageRating(counts: number[]) {
  const total = counts.reduce((a, b) => a + b, 0)
  if (!total) return 0
  return counts.reduce((sum, c, i) => sum + c * (i + 1), 0) / total
}
