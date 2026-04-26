import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { HomePage } from '../HomePage'
import { renderWithProviders } from '@/test/render'

vi.mock('@/hooks/useBookings', () => ({
  useUpcomingBookings: () => mockUpcoming(),
}))
vi.mock('@/hooks/useAmenities', () => ({
  useAmenities: () => mockAmenities(),
}))
vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUser(),
}))

const mockUpcoming = vi.hoisted(() => vi.fn())
const mockAmenities = vi.hoisted(() => vi.fn())
const mockUser = vi.hoisted(() => vi.fn())

const MOCK_USER = {
  id: 'user-001', name: 'Julian Ashworth', email: 'julian@test.com',
  phone: '+1 555 000', residentId: 'resident.042',
}

const MOCK_AMENITIES = [
  { id: 'pool', title: 'Infinity Swimming Pool', image: 'https://example.com/pool.jpg', badge: 'OPEN', badgeVariant: 'open', rating: '4.9', location: 'Rooftop', categories: ['all'], footerInfo: 'Available', footerInfoMuted: true, bookPath: '/amenities/pool/book' },
  { id: 'badminton', title: 'Badminton Courts', image: 'https://example.com/bad.jpg', badge: 'OPEN', badgeVariant: 'open', rating: '4.7', location: 'Level 3', categories: ['all'], footerInfo: 'Available', footerInfoMuted: true, bookPath: '/amenities/badminton/book' },
]

const MOCK_BOOKING = {
  id: 'b1', amenityId: 'pool', amenityTitle: 'Infinity Swimming Pool',
  image: 'https://example.com/pool.jpg', status: 'confirmed' as const,
  date: '2026-05-01', time: '09:00 AM', userId: 'user-001', slotId: 's1',
}

beforeEach(() => {
  mockUser.mockReturnValue({ data: MOCK_USER })
  mockAmenities.mockReturnValue({ data: MOCK_AMENITIES, isLoading: false })
  mockUpcoming.mockReturnValue({ data: [], isLoading: false })
})

describe('HomePage', () => {
  it('renders the hero banner with user first name', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome home, julian/i)
  })

  it('shows open amenity count in the banner', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByText(/2 amenities open/i)).toBeInTheDocument()
  })

  it('renders the popular amenities section heading', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByText(/popular amenities/i)).toBeInTheDocument()
  })

  it('renders the digital concierge section with all four cards', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByText(/digital concierge/i)).toBeInTheDocument()
    expect(screen.getAllByText(/guest pass/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/maintenance/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/parcel pickup/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/feedback/i).length).toBeGreaterThan(0)
  })

  it('feedback card links to /feedback', () => {
    renderWithProviders(<HomePage />)
    const feedbackLinks = screen.getAllByRole('link', { name: /feedback/i })
    expect(feedbackLinks.some(l => l.getAttribute('href') === '/feedback')).toBe(true)
  })

  it('maintenance card links to /maintenance', () => {
    renderWithProviders(<HomePage />)
    const links = screen.getAllByRole('link', { name: /maintenance/i })
    expect(links.some(l => l.getAttribute('href') === '/maintenance')).toBe(true)
  })

  it('shows no upcoming placeholder when there are no bookings', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByText(/no upcoming reservations/i)).toBeInTheDocument()
  })

  it('shows next reservation card when a booking exists', () => {
    mockUpcoming.mockReturnValue({ data: [MOCK_BOOKING], isLoading: false })
    renderWithProviders(<HomePage />)
    expect(screen.getByText(/your next reservation/i)).toBeInTheDocument()
  })

  it('shows resident name in the resident summary card', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getAllByText('Julian Ashworth').length).toBeGreaterThan(0)
  })

  it('renders loading spinner while bookings are loading', () => {
    mockUpcoming.mockReturnValue({ data: [], isLoading: true })
    renderWithProviders(<HomePage />)
    expect(screen.getByRole('status', { name: /loading reservations/i })).toBeInTheDocument()
  })

  it('browse amenities link navigates to /amenities', () => {
    renderWithProviders(<HomePage />)
    const amenitiesLinks = screen.getAllByRole('link', { name: /amenities/i })
    expect(amenitiesLinks.some(l => l.getAttribute('href') === '/amenities')).toBe(true)
  })
})
