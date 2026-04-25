import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from '../NotFoundPage'
import { renderWithProviders } from '@/test/render'

describe('NotFoundPage', () => {
  it('renders 404 heading and description', () => {
    renderWithProviders(<NotFoundPage />)
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    expect(screen.getByText(/doesn't exist or has been moved/i)).toBeInTheDocument()
  })

  it('renders a back home link', () => {
    renderWithProviders(<NotFoundPage />)
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/')
  })
})
