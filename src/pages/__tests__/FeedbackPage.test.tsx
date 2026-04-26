import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { FeedbackPage } from '../FeedbackPage'
import { renderWithProviders } from '@/test/render'

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('@/hooks/useAmenities', () => ({
  useAmenities: () => ({
    data: [
      { id: 'pool', title: 'Infinity Swimming Pool', image: 'https://example.com/pool.jpg', location: 'Rooftop', badge: 'OPEN', badgeVariant: 'open', rating: '4.9', categories: ['all'], footerInfo: '', footerInfoMuted: false, bookPath: null },
      { id: 'badminton', title: 'Badminton Courts', image: 'https://example.com/bad.jpg', location: 'Level 3', badge: 'OPEN', badgeVariant: 'open', rating: '4.7', categories: ['all'], footerInfo: '', footerInfoMuted: false, bookPath: null },
    ],
    isLoading: false,
  }),
}))

beforeEach(() => {
  mockNavigate.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

async function fillAndSubmitForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /general/i }))
  await user.click(screen.getByRole('radio', { name: /4 stars/i }))
  await user.type(screen.getByLabelText(/subject/i), 'Great facilities overall')
  await user.type(screen.getByLabelText(/message/i), 'Everything is well-maintained and the staff is very helpful.')
  await user.click(screen.getByRole('button', { name: /submit feedback/i }))
}

describe('FeedbackPage', () => {
  it('renders the page heading', () => {
    renderWithProviders(<FeedbackPage />)
    expect(screen.getByRole('heading', { name: /share your feedback/i })).toBeInTheDocument()
  })

  it('renders all six category options', () => {
    renderWithProviders(<FeedbackPage />)
    expect(screen.getByRole('radio', { name: /amenities/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /staff & service/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /maintenance/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /cleanliness/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /noise/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /general/i })).toBeInTheDocument()
  })

  it('renders five star rating buttons', () => {
    renderWithProviders(<FeedbackPage />)
    const stars = screen.getAllByRole('radio', { name: /star/i })
    expect(stars).toHaveLength(5)
  })

  it('shows the rating label when a star is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackPage />)
    await user.click(screen.getByRole('radio', { name: /5 stars — excellent/i }))
    expect(await screen.findByText('Excellent')).toBeInTheDocument()
  })

  it('renders Subject and Message fields', () => {
    renderWithProviders(<FeedbackPage />)
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('renders amenity options from the hook', () => {
    renderWithProviders(<FeedbackPage />)
    expect(screen.getByRole('radio', { name: /infinity swimming pool/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /badminton courts/i })).toBeInTheDocument()
  })

  it('shows the Clear button when an amenity is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackPage />)
    await user.click(screen.getByRole('radio', { name: /infinity swimming pool/i }))
    expect(await screen.findByRole('button', { name: /clear amenity selection/i })).toBeInTheDocument()
  })

  it('clears the amenity when Clear is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackPage />)
    await user.click(screen.getByRole('radio', { name: /infinity swimming pool/i }))
    await user.click(await screen.findByRole('button', { name: /clear amenity selection/i }))
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /clear amenity selection/i })).not.toBeInTheDocument()
    })
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackPage />)
    await user.click(screen.getByRole('button', { name: /submit feedback/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('shows subject validation error when too short', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackPage />)
    await user.type(screen.getByLabelText(/subject/i), 'ab')
    await user.click(screen.getByRole('button', { name: /submit feedback/i }))
    await waitFor(() => {
      expect(screen.getByText(/at least 4 characters/i)).toBeInTheDocument()
    })
  })

  it('shows success state after a valid submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackPage />)
    await fillAndSubmitForm(user)
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /thank you/i })).toBeInTheDocument(),
      { timeout: 3000 },
    )
  }, 6000)

  it('back button navigates back', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackPage />)
    await user.click(screen.getByRole('button', { name: /go back/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('Submit Another resets back to the form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FeedbackPage />)
    await fillAndSubmitForm(user)
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /thank you/i })).toBeInTheDocument(),
      { timeout: 3000 },
    )
    await user.click(screen.getByRole('button', { name: /submit another/i }))
    expect(screen.getByRole('heading', { name: /share your feedback/i })).toBeInTheDocument()
  }, 6000)
})
