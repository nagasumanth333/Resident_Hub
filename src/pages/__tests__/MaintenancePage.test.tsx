import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { MaintenancePage } from '../MaintenancePage'
import { renderWithProviders } from '@/test/render'

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: { id: 'user-001', name: 'Julian Ashworth', residentId: 'resident.042' },
  }),
}))

beforeEach(() => {
  mockNavigate.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /plumbing/i }))
  await user.click(screen.getByRole('radio', { name: /kitchen/i }))
  await user.click(screen.getByRole('radio', { name: /medium/i }))
  await user.type(screen.getByLabelText(/issue title/i), 'Tap leaking under sink')
  await user.type(screen.getByLabelText(/description/i), 'The kitchen tap has been dripping continuously for two days.')
  await user.click(screen.getByRole('radio', { name: /morning/i }))
  await user.click(screen.getByRole('button', { name: /submit request/i }))
}

describe('MaintenancePage', () => {
  it('renders the page heading', () => {
    renderWithProviders(<MaintenancePage />)
    expect(screen.getByRole('heading', { name: /maintenance request/i })).toBeInTheDocument()
  })

  it('shows the resident name in the hero strip', () => {
    renderWithProviders(<MaintenancePage />)
    expect(screen.getByText('Julian Ashworth')).toBeInTheDocument()
  })

  it('renders all eight issue type options', () => {
    renderWithProviders(<MaintenancePage />)
    expect(screen.getByRole('radio', { name: /plumbing/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /electrical/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /ac \/ heating/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /appliances/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /doors & windows/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /pest control/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /cleaning/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /other/i })).toBeInTheDocument()
  })

  it('renders location options', () => {
    renderWithProviders(<MaintenancePage />)
    expect(screen.getByRole('radio', { name: /kitchen/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /bathroom/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /bedroom/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /living room/i })).toBeInTheDocument()
  })

  it('renders all four priority levels', () => {
    renderWithProviders(<MaintenancePage />)
    expect(screen.getByRole('radio', { name: /^low/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^medium/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^high/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^urgent/i })).toBeInTheDocument()
  })

  it('shows emergency warning banner when Urgent is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MaintenancePage />)
    await user.click(screen.getByRole('radio', { name: /^urgent/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/24\/7 emergency line/i)).toBeInTheDocument()
    })
  })

  it('hides the warning banner when non-urgent priority is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MaintenancePage />)
    await user.click(screen.getByRole('radio', { name: /^urgent/i }))
    await screen.findByRole('alert')
    await user.click(screen.getByRole('radio', { name: /^medium/i }))
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('renders all four preferred time options', () => {
    renderWithProviders(<MaintenancePage />)
    expect(screen.getByRole('radio', { name: /^morning/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^afternoon/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^evening/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /any time/i })).toBeInTheDocument()
  })

  it('shows dynamic response-time estimate based on priority', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MaintenancePage />)

    await user.click(screen.getByRole('radio', { name: /^urgent/i }))
    expect(await screen.findByText(/2 hours/i)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /^high/i }))
    expect(await screen.findByText(/24 hours/i)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /^low/i }))
    expect(await screen.findByText(/5–7 business days/i)).toBeInTheDocument()
  })

  it('renders Issue Title and Description fields', () => {
    renderWithProviders(<MaintenancePage />)
    expect(screen.getByLabelText(/issue title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MaintenancePage />)
    await user.click(screen.getByRole('button', { name: /submit request/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('shows title validation error when too short', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MaintenancePage />)
    await user.type(screen.getByLabelText(/issue title/i), 'ab')
    await user.click(screen.getByRole('button', { name: /submit request/i }))
    await waitFor(() => {
      expect(screen.getByText(/at least 4 characters/i)).toBeInTheDocument()
    })
  })

  it('shows success state with a reference number after valid submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MaintenancePage />)

    await fillAndSubmit(user)
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /request submitted/i })).toBeInTheDocument(),
      { timeout: 3000 },
    )
    expect(screen.getByText(/MNT-/)).toBeInTheDocument()
  }, 6000)

  it('Submit Another Request resets back to the form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MaintenancePage />)

    await fillAndSubmit(user)
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /request submitted/i })).toBeInTheDocument(),
      { timeout: 3000 },
    )

    await user.click(screen.getByRole('button', { name: /submit another request/i }))
    expect(screen.getByRole('heading', { name: /maintenance request/i })).toBeInTheDocument()
  }, 6000)

  it('back button navigates back', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MaintenancePage />)
    await user.click(screen.getByRole('button', { name: /go back/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
