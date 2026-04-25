import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import i18next from 'i18next'
import type { ReactElement } from 'react'
import { initReactI18next } from 'react-i18next'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import en from '@/locales/en'

// Minimal i18n instance for tests — English only, no async loading
i18next.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: en } },
  interpolation: { escapeValue: false },
})

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

type Options = RenderOptions & {
  routerProps?: MemoryRouterProps
}

export function renderWithProviders(ui: ReactElement, { routerProps, ...options }: Options = {}) {
  const queryClient = makeQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient }
}
