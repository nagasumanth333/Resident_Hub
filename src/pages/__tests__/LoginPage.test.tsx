import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LoginPage } from '../LoginPage'
import { renderWithProviders } from '@/test/render'

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

beforeEach(() => {
  mockNavigate.mockReset()
})

describe('LoginPage', () => {
  it('renders the login form fields', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByLabelText(/resident id or email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting an empty form', async () => {
    renderWithProviders(<LoginPage />)
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('shows error when password is too short', async () => {
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/resident id or email/i), 'resident.042')
    await userEvent.type(screen.getByLabelText(/^password$/i), '123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('navigates to home on successful login', async () => {
    renderWithProviders(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/resident id or email/i), 'resident.042')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('renders forgot password and contact concierge links', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact concierge/i })).toBeInTheDocument()
  })

  it('renders remember this device checkbox unchecked by default', () => {
    renderWithProviders(<LoginPage />)
    const checkbox = screen.getByRole('checkbox', { name: /remember this device/i })
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })
})
