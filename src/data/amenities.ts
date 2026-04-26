export type Amenity = {
  id: string
  title: string
  description: string
  image: string
  badge: string
  badgeVariant: 'open' | 'limited' | 'booked'
  categories: string[]
  rating: string
  location: string
  reviewCount: number
  capacityLabel: string
  featured: boolean
  bookPath: string | null
  footerInfo: string
  footerInfoMuted: boolean
}

export const AMENITIES: Amenity[] = [
  {
    id: 'pool',
    title: 'Infinity Swimming Pool',
    description:
      "Temperature-controlled olympic-sized pool with a separate children's splash area and poolside lounge.",
    image: 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'FULLY BOOKED',
    badgeVariant: 'booked',
    categories: ['all', 'sports', 'wellness'],
    rating: '4.9',
    location: 'Rooftop, Tower A',
    reviewCount: 210,
    capacityLabel: 'Max 12 Guests',
    featured: true,
    bookPath: '/amenities/pool/book',
    footerInfo: 'Waitlist Open',
    footerInfoMuted: true,
  },
  {
    id: 'badminton',
    title: 'Badminton Courts',
    description: 'Four professional-grade wooden courts with high-intensity floodlighting for evening play.',
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'OPEN',
    badgeVariant: 'open',
    categories: ['all', 'sports'],
    rating: '4.7',
    location: 'Clubhouse, Level 3',
    reviewCount: 124,
    capacityLabel: 'Max 4 Players',
    featured: false,
    bookPath: '/amenities/badminton/book',
    footerInfo: '4 Slots Left',
    footerInfoMuted: false,
  },
  {
    id: 'squash',
    title: 'Squash Court',
    description:
      'Three air-conditioned squash courts with international standard dimensions and glass spectator viewing.',
    image: 'https://images.pexels.com/photos/15390865/pexels-photo-15390865.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'LIMITED SLOTS',
    badgeVariant: 'limited',
    categories: ['all', 'sports'],
    rating: '4.6',
    location: 'Clubhouse, Level 2',
    reviewCount: 87,
    capacityLabel: 'Max 2 Players',
    featured: false,
    bookPath: null,
    footerInfo: '2 Slots Left',
    footerInfoMuted: false,
  },
  {
    id: 'grand-hall',
    title: 'The Grand Hall',
    description:
      'Multi-purpose banquet hall for up to 200 guests. Equipped with professional sound system and catering prep kitchen.',
    image: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'OPEN',
    badgeVariant: 'open',
    categories: ['all', 'events'],
    rating: '4.8',
    location: 'Podium, Level 1',
    reviewCount: 56,
    capacityLabel: 'Up to 200 Guests',
    featured: false,
    bookPath: null,
    footerInfo: 'Available',
    footerInfoMuted: true,
  },
  {
    id: 'wellness-hub',
    title: 'Wellness Hub',
    description:
      'State-of-the-art fitness center with cardio zones, free weights, and dedicated yoga & pilates studio.',
    image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'OPEN',
    badgeVariant: 'open',
    categories: ['all', 'wellness'],
    rating: '4.8',
    location: 'Podium, Level 2',
    reviewCount: 142,
    capacityLabel: 'Open Access',
    featured: false,
    bookPath: null,
    footerInfo: 'Open Now',
    footerInfoMuted: true,
  },
  {
    id: 'cricket-nets',
    title: 'Cricket Nets',
    description:
      'Four professional practice nets with synthetic turf pitches and automated bowling machines. Ideal for batting drills, net sessions and fielding practice.',
    image: 'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'OPEN',
    badgeVariant: 'open',
    categories: ['all', 'sports'],
    rating: '4.5',
    location: 'Outdoor Courts, Ground Level',
    reviewCount: 67,
    capacityLabel: 'Max 6 Players',
    featured: false,
    bookPath: '/amenities/cricket-nets/book',
    footerInfo: '6 Slots Left',
    footerInfoMuted: false,
  },
  {
    id: 'pickleball',
    title: 'Pickleball Court',
    description:
      'Two dedicated pickleball courts with cushioned hard surfaces and permanent court markings. Paddles and balls available at the equipment counter.',
    image: 'https://images.pexels.com/photos/32975182/pexels-photo-32975182.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'OPEN',
    badgeVariant: 'open',
    categories: ['all', 'sports'],
    rating: '4.6',
    location: 'Clubhouse, Level 2',
    reviewCount: 43,
    capacityLabel: 'Max 4 Players',
    featured: false,
    bookPath: '/amenities/pickleball/book',
    footerInfo: 'Available',
    footerInfoMuted: true,
  },
  {
    id: 'tennis',
    title: 'Tennis Courts',
    description:
      'Two floodlit hard courts with ITF-approved surfaces. Ball machines, racket rental and court bookings available. Professional coaching sessions on request.',
    image: 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'LIMITED SLOTS',
    badgeVariant: 'limited',
    categories: ['all', 'sports'],
    rating: '4.8',
    location: 'Outdoor Courts, Level 1',
    reviewCount: 156,
    capacityLabel: 'Max 4 Players',
    featured: false,
    bookPath: '/amenities/tennis/book',
    footerInfo: '3 Slots Left',
    footerInfoMuted: false,
  },
  {
    id: 'football',
    title: '5-a-Side Football',
    description:
      'Floodlit synthetic turf pitch for fast-paced 5-a-side matches. Goals, coloured bibs and match equipment provided. Monthly weekend tournaments open to all residents.',
    image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'OPEN',
    badgeVariant: 'open',
    categories: ['all', 'sports'],
    rating: '4.7',
    location: 'Sports Ground, Tower B',
    reviewCount: 92,
    capacityLabel: 'Max 10 Players',
    featured: false,
    bookPath: '/amenities/football/book',
    footerInfo: 'Available',
    footerInfoMuted: true,
  },
  {
    id: 'skating-rink',
    title: 'Skating Rink',
    description:
      'Covered inline skating rink with LED ambient lighting and a smooth maple-composite surface. Skate hire included with every booking. Friday evenings feature resident DJ sessions.',
    image: 'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=640',
    badge: 'OPEN',
    badgeVariant: 'open',
    categories: ['all', 'sports', 'wellness'],
    rating: '4.4',
    location: 'Podium, Level 3',
    reviewCount: 38,
    capacityLabel: 'Max 30 Skaters',
    featured: false,
    bookPath: '/amenities/skating-rink/book',
    footerInfo: 'Open Now',
    footerInfoMuted: true,
  },
]

export function getAmenity(id: string): Amenity | undefined {
  return AMENITIES.find((a) => a.id === id)
}
