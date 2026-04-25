import '@/lib/i18n'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from '@/App.tsx'
import { ThemeProvider } from '@/contexts/ThemeContext.tsx'
import { queryClient } from '@/lib/queryClient.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster richColors position="top-right" />
        {import.meta.env.DEV ? (
          <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
