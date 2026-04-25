import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom does not implement ResizeObserver
global.ResizeObserver = class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(_cb: ResizeObserverCallback) {}
}

// jsdom does not implement IntersectionObserver
global.IntersectionObserver = class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
}
