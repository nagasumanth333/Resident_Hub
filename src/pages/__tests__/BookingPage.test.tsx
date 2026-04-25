import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { BookingPage } from '../BookingPage'
import { renderWithProviders } from '@/test/render'

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ amenityId: 'pool' }),
  }
})

const mockUseAmenity = vi.hoisted(() => vi.fn())
const mockUseSlots = vi.hoisted(() => vi.fn())
const mockCreateBooking = vi.hoisted(() => vi.fn())
const mockUser = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAmenities', () => ({
  useAmenity: () => mockUseAmenity(),
}))
vi.mock('@/hooks/useSlots', () => ({
  useSlots: () => mockUseSlots(),
}))
vi.mock('@/hooks/useBookings', () => ({
  useCreateBooking: () => ({ mutate: mockCreateBooking, isPending: false }),
}))
vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUser(),
}))

const MOCK_AMENITY = {
  id: 'pool', title: 'Infinity Swimming Pool', image: 'https://example.com/pool.jpg',
  badge: 'OPEN', rating: '4.9', location: 'Rooftop, Tower A', reviewCount: 210,
  capacityLabel: 'Max 12 Guests',
}

const MOCK_SLOTS = [
  { id: 'slot-1', label: '09:00 AM', status: 'available' },
  { id: 'slot-2', label: '10:00 AM', status: 'booked' },
  { id: 'slot-3', label: '11:00 AM', status: 'mine' },
]

beforeEach(() => {
  mockUseAmenity.mockReturnValue({ data: MOCK_AMENITY, isLoading: false })
  mockUseSlots.mockReturnValue({ data: MOCK_SLOTS, isLoading: false })
  mockUser.mockReturnValue({ data: { id: 'user-001', name: 'Julian Ashworth' } })
  mockNavigate.mockReset()
  mockCreateBooking.mockReset()
})

describe('BookingPage', () => {
  it('renders the amenity title in the hero', () => {
    renderWithProviders(<BookingPage />)
    expect(screen.getByRole('heading', { name: /infinity swimming pool/i })).toBeInTheDocument()
  })

  it('renders amenity metadata — location, rating, capacity', () => {
    renderWithProviders(<BookingPage />)
    expect(screen.getByText(/rooftop, tower a/i)).toBeInTheDocument()
    expect(screen.getByText('4.9')).toBeInTheDocument()
    expect(screen.getByText(/max 12 guests/i)).toBeInTheDocument()
  })

  it('renders the Select Date section', () => {
    renderWithProviders(<BookingPage />)
    expect(screen.getByRole('heading', { name: /select date/i })).toBeInTheDocument()
  })

  it('renders available slots', async () => {
    renderWithProviders(<BookingPage />)
    expect(await screen.findByRole('button', { name: /09:00 am — available/i })).toBeInTheDocument()
  })

  it('renders a booked slot as disabled', async () => {
    renderWithProviders(<BookingPage />)
    const booked = await screen.findByRole('button', { name: /10:00 am — booked/i })
    expect(booked).toBeDisabled()
  })

  it('renders a mine slot as disabled', async () => {
    renderWithProviders(<BookingPage />)
    const mine = await screen.findByRole('button', { name: /11:00 am — my booking/i })
    expect(mine).toBeDisabled()
  })

  it('Confirm Booking button is disabled when no slot is selected', () => {
    renderWithProviders(<BookingPage />)
    expect(screen.getByRole('button', { name: /confirm booking/i })).toBeDisabled()
  })

  it('enables Confirm button after selecting an available slot', async () => {
    renderWithProviders(<BookingPage />)
    await userEvent.click(await screen.findByRole('button', { name: /09:00 am — available/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm booking/i })).not.toBeDisabled()
    })
  })

  it('marks selected slot with aria-pressed true', async () => {
    renderWithProviders(<BookingPage />)
    const slot = await screen.findByRole('button', { name: /09:00 am/i })
    await userEvent.click(slot)
    await waitFor(() => {
      expect(slot).toHaveAttribute('aria-pressed', 'true')
    })
  })

  it('calls createBooking when Confirm is clicked with a slot selected', async () => {
    renderWithProviders(<BookingPage />)
    await userEvent.click(await screen.findByRole('button', { name: /09:00 am — available/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm booking/i }))
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({ slotId: 'slot-1', amenityId: 'pool' }),
        expect.any(Object),
      )
    })
  })

  it('shows loading spinner while amenity data is loading', () => {
    mockUseAmenity.mockReturnValue({ data: undefined, isLoading: true })
    renderWithProviders(<BookingPage />)
    expect(screen.getByRole('status', { name: /loading amenity details/i })).toBeInTheDocument()
  })

  it('shows empty message when no slots are available', async () => {
    mockUseSlots.mockReturnValue({ data: [], isLoading: false })
    renderWithProviders(<BookingPage />)
    expect(await screen.findByText(/no slots available for this date/i)).toBeInTheDocument()
  })

  it('go back button navigates back', async () => {
    renderWithProviders(<BookingPage />)
    await userEvent.click(screen.getByRole('button', { name: /go back/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
