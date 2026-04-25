import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ProfilePage } from '../ProfilePage'
import { renderWithProviders } from '@/test/render'

const mockUser = vi.hoisted(() => vi.fn())
const mockMutateAsync = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useUser', () => ({
  useUser:       () => mockUser(),
  useUpdateUser: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const MOCK_USER = {
  id: 'user-001',
  name: 'Julian Ashworth',
  email: 'julian@residenthub.com',
  phone: '+1 (555) 234-8901',
  residentId: 'resident.042',
}

beforeEach(() => {
  mockUser.mockReturnValue({ data: MOCK_USER, isLoading: false })
  mockMutateAsync.mockResolvedValue(MOCK_USER)
})

describe('ProfilePage', () => {
  it('renders the user name in the hero', () => {
    renderWithProviders(<ProfilePage />)
    expect(screen.getByRole('heading', { name: /julian ashworth/i })).toBeInTheDocument()
  })

  it('renders the resident ID somewhere on the page', () => {
    renderWithProviders(<ProfilePage />)
    const matches = screen.getAllByText('resident.042')
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders email and phone in Personal Information card', () => {
    renderWithProviders(<ProfilePage />)
    expect(screen.getByText('julian@residenthub.com')).toBeInTheDocument()
    expect(screen.getByText('+1 (555) 234-8901')).toBeInTheDocument()
  })

  it('shows loading skeleton when user data is loading', () => {
    mockUser.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = renderWithProviders(<ProfilePage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('Edit button reveals the edit form', async () => {
    renderWithProviders(<ProfilePage />)
    await userEvent.click(screen.getByRole('button', { name: /edit personal information/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })
  })

  it('pre-fills edit form with current user data', async () => {
    renderWithProviders(<ProfilePage />)
    await userEvent.click(screen.getByRole('button', { name: /edit personal information/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue('Julian Ashworth')
      expect(screen.getByLabelText(/email address/i)).toHaveValue('julian@residenthub.com')
    })
  })

  it('shows validation error when name is cleared and form submitted', async () => {
    renderWithProviders(<ProfilePage />)
    await userEvent.click(screen.getByRole('button', { name: /edit personal information/i }))
    const nameInput = await screen.findByLabelText(/full name/i)
    await userEvent.clear(nameInput)
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('calls updateUser with new values on successful save', async () => {
    renderWithProviders(<ProfilePage />)
    await userEvent.click(screen.getByRole('button', { name: /edit personal information/i }))
    const nameInput = await screen.findByLabelText(/full name/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Sarah Connor')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Sarah Connor' }),
      )
    })
  })

  it('X button exits edit mode without saving', async () => {
    renderWithProviders(<ProfilePage />)
    await userEvent.click(screen.getByRole('button', { name: /edit personal information/i }))
    await screen.findByLabelText(/full name/i)
    await userEvent.click(screen.getByRole('button', { name: /cancel editing/i }))
    await waitFor(() => {
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument()
    })
    // name is still visible in view mode
    expect(screen.getAllByText('Julian Ashworth').length).toBeGreaterThan(0)
  })

  it('renders notification preference toggles', () => {
    renderWithProviders(<ProfilePage />)
    const toggles = screen.getAllByRole('switch')
    expect(toggles.length).toBeGreaterThan(0)
  })

  it('clicking a preference switch flips its state', async () => {
    renderWithProviders(<ProfilePage />)
    const [firstToggle] = screen.getAllByRole('switch')
    const before = firstToggle.getAttribute('aria-checked')
    await userEvent.click(firstToggle)
    await waitFor(() => {
      expect(firstToggle.getAttribute('aria-checked')).not.toBe(before)
    })
  })

  it('renders booking stats section', () => {
    renderWithProviders(<ProfilePage />)
    expect(screen.getByText('Total Bookings')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})
