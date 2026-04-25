import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AmenitiesPage } from '../AmenitiesPage'
import { renderWithProviders } from '@/test/render'

const mockUseAmenities = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAmenities', () => ({
  useAmenities: (filter?: string) => mockUseAmenities(filter),
}))

const MOCK_AMENITIES = [
  { id: 'pool', title: 'Infinity Swimming Pool', image: 'https://example.com/pool.jpg', badge: 'FULLY BOOKED', badgeVariant: 'booked', rating: '4.9', location: 'Rooftop', categories: ['all', 'sports', 'wellness'], footerInfo: '', footerInfoMuted: false, bookPath: null, featured: true, description: 'A pool.', reviewCount: 10, capacityLabel: 'Max 12' },
  { id: 'badminton', title: 'Badminton Courts', image: 'https://example.com/bad.jpg', badge: 'OPEN', badgeVariant: 'open', rating: '4.7', location: 'Level 3', categories: ['all', 'sports'], footerInfo: 'Available', footerInfoMuted: true, bookPath: '/amenities/badminton/book', featured: false, description: 'Badminton.', reviewCount: 5, capacityLabel: 'Max 4' },
  { id: 'wellness-hub', title: 'Wellness Hub', image: 'https://example.com/wh.jpg', badge: 'OPEN', badgeVariant: 'open', rating: '4.8', location: 'Level 2', categories: ['all', 'wellness'], footerInfo: 'Available', footerInfoMuted: true, bookPath: '/amenities/wellness-hub/book', featured: false, description: 'Wellness.', reviewCount: 8, capacityLabel: 'Max 8' },
]

beforeEach(() => {
  mockUseAmenities.mockReturnValue({ data: MOCK_AMENITIES, isLoading: false })
})

describe('AmenitiesPage', () => {
  it('renders the page title and subtitle', () => {
    renderWithProviders(<AmenitiesPage />)
    expect(screen.getByRole('heading', { name: /our amenities/i })).toBeInTheDocument()
    expect(screen.getByText(/curated facilities/i)).toBeInTheDocument()
  })

  it('renders all four filter tabs', () => {
    renderWithProviders(<AmenitiesPage />)
    expect(screen.getByRole('tab', { name: /all facilities/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^sports$/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^wellness$/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^events$/i })).toBeInTheDocument()
  })

  it('renders amenity cards from the hook', () => {
    renderWithProviders(<AmenitiesPage />)
    expect(screen.getByText('Infinity Swimming Pool')).toBeInTheDocument()
    expect(screen.getByText('Badminton Courts')).toBeInTheDocument()
    expect(screen.getByText('Wellness Hub')).toBeInTheDocument()
  })

  it('shows a loading spinner while data is loading', () => {
    mockUseAmenities.mockReturnValue({ data: [], isLoading: true })
    renderWithProviders(<AmenitiesPage />)
    expect(screen.getByRole('status', { name: /loading amenities/i })).toBeInTheDocument()
  })

  it('shows Book Now link for bookable amenities', () => {
    renderWithProviders(<AmenitiesPage />)
    expect(screen.getAllByRole('link', { name: /book now/i }).length).toBeGreaterThan(0)
  })

  it('shows Join Waitlist for fully booked amenities', () => {
    renderWithProviders(<AmenitiesPage />)
    expect(screen.getByRole('button', { name: /join waitlist/i })).toBeInTheDocument()
  })

  it('changes active filter when Sports tab is clicked', async () => {
    renderWithProviders(<AmenitiesPage />)
    await userEvent.click(screen.getByRole('tab', { name: /^sports$/i }))
    await waitFor(() => {
      expect(mockUseAmenities).toHaveBeenCalledWith('sports')
    })
  })

  it('shows empty state when no amenities match', () => {
    mockUseAmenities.mockReturnValue({ data: [], isLoading: false })
    renderWithProviders(<AmenitiesPage />)
    expect(screen.getByText(/no amenities found/i)).toBeInTheDocument()
  })

  it('All Facilities tab is selected by default', () => {
    renderWithProviders(<AmenitiesPage />)
    expect(screen.getByRole('tab', { name: /all facilities/i })).toHaveAttribute('aria-selected', 'true')
  })
})
