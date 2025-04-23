import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import 'resize-observer-polyfill'
import mockRouter from 'next-router-mock'
// Use MemoryRouterProvider instead of AppRouterProvider for simpler mocking
// import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

// Mock the Next.js Pages Router (if still needed)
vi.mock('next/router', () => require('next-router-mock'))

// Mock the App Router hooks explicitly
vi.mock('next/navigation', () => {
  const routerMock = require('next-router-mock');
  return {
    // __esModule: true, // Might be needed depending on CJS/ESM interop
    usePathname: routerMock.usePathname,
    useRouter: routerMock.useRouter,
    useParams: () => ({
      locale: 'en',
      // Add other params as needed or override in tests
    }),
    useSearchParams: () => new URLSearchParams(),
    // Add other exports from 'next/navigation' if needed by components
    // Example: redirect: vi.fn(), permanentRedirect: vi.fn()
  }
});

// Set required environment variables for Supabase client initialization in tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Extend Vitest's expect method with testing-library matchers
expect.extend(matchers)

// Cleanup after each test case
afterEach(() => {
  cleanup()
  mockRouter.push('/')
}) 