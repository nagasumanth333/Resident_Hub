import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { BookingsPage } from '../BookingsPage'
import { renderWithProviders } from '@/test/render'
import type { Booking } from '@/hooks/useBookings'

const mockUpcoming = vi.hoisted(() => vi.fn())
const mockHistory = vi.hoisted(() => vi.fn())
const mockHistoryInfinite = vi.hoisted(() => vi.fn())
const mockCancel = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useBookings', () => ({
  useUpcomingBookings:       () => mockUpcoming(),
  useBookingHistory:         () => mockHistory(),
  useBookingHistoryInfinite: () => mockHistoryInfinite(),
  useCancelBooking:          () => ({ mutate: mockCancel, isPending: false }),
}))

const UPCOMING: Booking[] = [
  { id: 'b1', userId: 'user-001', amenityId: 'pool', amenityTitle: 'Infinity Swimming Pool', image: 'https://example.com/pool.jpg', slotId: 's1', status: 'confirmed', date: '2026-05-10', time: '09:00 AM' },
  { id: 'b2', userId: 'user-001', amenityId: 'badminton', amenityTitle: 'Badminton Courts', image: 'https://example.com/bad.jpg', slotId: 's2', status: 'pending', date: '2026-05-15', time: '11:00 AM' },
]

const HISTORY: Booking[] = [
  { id: 'b3', userId: 'user-001', amenityId: 'squash', amenityTitle: 'Squash Court', image: 'https://example.com/sq.jpg', slotId: 's3', status: 'completed', date: '2026-04-01', time: '10:00 AM' },
  { id: 'b4', userId: 'user-001', amenityId: 'wellness-hub', amenityTitle: 'Wellness Hub', image: 'https://example.com/wh.jpg', slotId: 's4', status: 'cancelled', date: '2026-03-20', time: '02:00 PM' },
]

function makeInfiniteResult(items: Booking[]) {
  return {
    data: { pages: [{ items, total: items.length, hasMore: false }], pageParams: [1] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  }
}

beforeEach(() => {
  mockUpcoming.mockReturnValue({ data: UPCOMING, isLoading: false })
  mockHistory.mockReturnValue({ data: HISTORY, isLoading: false })
  mockHistoryInfinite.mockReturnValue(makeInfiniteResult(HISTORY))
  mockCancel.mockReset()
})

describe('BookingsPage', () => {
  it('renders the page heading', () => {
    renderWithProviders(<BookingsPage />)
    expect(screen.getByRole('heading', { name: /my bookings/i })).toBeInTheDocument()
  })

  it('renders Upcoming and History tabs', () => {
    renderWithProviders(<BookingsPage />)
    expect(screen.getByRole('tab', { name: /upcoming/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /history/i })).toBeInTheDocument()
  })

  it('shows upcoming bookings by default', async () => {
    renderWithProviders(<BookingsPage />)
    await waitFor(() => {
      expect(screen.getByText('Infinity Swimming Pool')).toBeInTheDocument()
      expect(screen.getByText('Badminton Courts')).toBeInTheDocument()
    })
  })

  it('shows confirmed and pending status badges', async () => {
    renderWithProviders(<BookingsPage />)
    await waitFor(() => {
      expect(screen.getByText(/confirmed/i)).toBeInTheDocument()
      expect(screen.getByText(/pending/i)).toBeInTheDocument()
    })
  })

  it('renders cancel buttons for upcoming bookings', async () => {
    renderWithProviders(<BookingsPage />)
    await waitFor(() => {
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
      expect(cancelButtons.length).toBe(UPCOMING.length)
    })
  })

  it('calls cancel mutation when cancel is clicked', async () => {
    renderWithProviders(<BookingsPage />)
    const [firstCancel] = await screen.findAllByRole('button', { name: /cancel/i })
    await userEvent.click(firstCancel)
    await waitFor(() => {
      expect(mockCancel).toHaveBeenCalledWith('b1')
    })
  })

  it('shows no upcoming message when list is empty', () => {
    mockUpcoming.mockReturnValue({ data: [], isLoading: false })
    renderWithProviders(<BookingsPage />)
    expect(screen.getByText(/no upcoming bookings/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse amenities/i })).toBeInTheDocument()
  })

  it('shows loading spinner while upcoming bookings load', () => {
    mockUpcoming.mockReturnValue({ data: [], isLoading: true })
    renderWithProviders(<BookingsPage />)
    expect(screen.getByRole('status', { name: /loading upcoming bookings/i })).toBeInTheDocument()
  })

  it('switches to history tab when clicked', async () => {
    renderWithProviders(<BookingsPage />)
    await userEvent.click(screen.getByRole('tab', { name: /history/i }))
    await waitFor(() => {
      expect(screen.getByText(/all history/i)).toBeInTheDocument()
    })
  })

  it('shows history items in the history tab', async () => {
    renderWithProviders(<BookingsPage />)
    await userEvent.click(screen.getByRole('tab', { name: /history/i }))
    await waitFor(() => {
      expect(screen.getByText('Squash Court')).toBeInTheDocument()
    })
  })

  it('shows completed and cancelled labels in history', async () => {
    renderWithProviders(<BookingsPage />)
    await userEvent.click(screen.getByRole('tab', { name: /history/i }))
    await waitFor(() => {
      expect(screen.getByText(/^completed$/i)).toBeInTheDocument()
      expect(screen.getByText(/^cancelled$/i)).toBeInTheDocument()
    })
  })

  it('shows no history message when history is empty', async () => {
    mockHistoryInfinite.mockReturnValue(makeInfiniteResult([]))
    renderWithProviders(<BookingsPage />)
    await userEvent.click(screen.getByRole('tab', { name: /history/i }))
    await waitFor(() => {
      expect(screen.getByText(/no past bookings yet/i)).toBeInTheDocument()
    })
  })

  it('activates history tab directly when ?tab=history is in URL', () => {
    renderWithProviders(<BookingsPage />, {
      routerProps: { initialEntries: ['/bookings?tab=history'] },
    })
    expect(screen.getByRole('tab', { name: /history/i })).toHaveAttribute('data-state', 'active')
  })
})
