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
  { id: 2, groupName: 'The Badger Borough', homeBase: 'Boise, ID', color: '#1f9e9a', members: 9 },
  { id: 3, groupName: 'The Treasure Valley Hunts', homeBase: 'Boise, ID', color: '#f2b544', members: 5 },
  { id: 4, groupName: 'The Marevelous McBrides', homeBase: 'Richmond, VA', color: '#3d6fb6', members: 3 },
  { id: 5, groupName: 'The Wortham Wing', homeBase: 'Charlotte, NC', color: '#903db6', members: 8 },
]

export type Activity = {
  id: number
  name: string
  description: string
  image: string
  when: string
  photoFolderId: string
}

export const activities: Activity[] = [
  {
    id: 7,
    name: 'Tybee Beach Day',
    description: 'Lounge, read, nap in hammocks, play frisbee, build sandcastles, or walk out to the pier.',
    image: IMAGES.hero,
    when: 'Tybee Island',
    photoFolderId: '1Rngxn-zj3cOIdzR2wZXw8-Ucyos0IjWU',
  },
  {
    id: 8,
    name: 'Dolphin Tour',
    description: 'Take a guided boat tour around Tybee Island and look for dolphins in the coastal waterways.',
    image: IMAGES.dolphins,
    when: 'Tybee Island',
    photoFolderId: '1jthatSUasibWuDDzIaO3wlbxp3I4wVg1',
  },
  {
    id: 9,
    name: 'Pier Walk, Hiking & Bike Rentals',
    description: 'Explore the pier, Back River Beach, and North Beach on foot or by rental bicycle.',
    image: IMAGES.hero,
    when: 'Tybee Island',
    photoFolderId: '1fnmQB6CxyShJYJ3jarFBI2i5N1soumEJ',
  },
  {
    id: 10,
    name: 'Fort Pulaski National Monument',
    description: 'Visit the historic fort, walk its grounds, and explore the exhibits at the national monument.',
    image: IMAGES.lighthouse,
    when: 'Near Tybee Island',
    photoFolderId: '1VFqr3a7ewvvc4SRZklYA860G0OcaIHpi',
  },
  {
    id: 11,
    name: 'Tybee Lighthouse, Battery & Museum',
    description: 'Tour the lighthouse and learn about Tybee’s coastal history at the battery and museum.',
    image: IMAGES.lighthouse,
    when: 'North Beach',
    photoFolderId: '13w7BYmVcWfT-Sy_6iVwPi15stbn4yR0S',
  },
  {
    id: 12,
    name: 'Beach House Hangout',
    description: 'Relax at the house with board games, movies, naps, and time together between outings.',
    image: IMAGES.family,
    when: 'At the rental',
    photoFolderId: '1sawC0wYBf3eYgS8eDthy6eVppu4uzcE9',
  },
  {
    id: 13,
    name: 'Savannah River Street & City Market',
    description: 'Walk Savannah’s waterfront, browse City Market, and enjoy shops, restaurants, and river views.',
    image: IMAGES.hero,
    when: 'Savannah',
    photoFolderId: '1ZtaizDWiw2OO1XxZHOqYbjh-XzB-H_6g',
  },
  {
    id: 14,
    name: 'Go-Kart Racing',
    description: 'Race go-karts, play mini-golf, and enjoy arcade games at a Savannah entertainment center.',
    image: IMAGES.hero,
    when: 'Near Savannah',
    photoFolderId: '1fbQFsXgK_eG14PxdBWAPPs9rCCfZ7h5y',
  },
  {
    id: 15,
    name: 'Savannah Museums & Historic Landmarks',
    description: 'Choose from SCAD, Telfair, the Cathedral of St. John the Baptist, Forsyth Park, and historic squares.',
    image: IMAGES.lighthouse,
    when: 'Savannah',
    photoFolderId: '1C5V7ovGhAzPZgR9wNgyP9knv3WXMb8B_',
  },
  {
    id: 16,
    name: 'Savannah Trolley Tour',
    description: 'Take a trolley tour and visit Savannah’s history museum and historic sites.',
    image: IMAGES.dolphins,
    when: 'Savannah',
    photoFolderId: '1s606CY0YTgDhjsLOWYGUNvw5f7S3ony3',
  },
]

export const faqs: { q: string; a: string }[] = [
  {
    q: 'Which airport should I fly into?',
    a: 'Savannah/Hilton Head International (SAV) is about 57 minutes from Tybee. Jacksonville (JAX) is a 2-hour drive if fares are much cheaper.',
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
