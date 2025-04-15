/// <reference types="jest" />
import { createClient } from '@/utils/supabase/client'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock @supabase/ssr using vi
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn()
  }))
}))

describe('Supabase Client', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    vi.clearAllMocks()
  })

  it('should create a Supabase client', () => {
    const client = createClient()
    expect(client).toBeTruthy()
    expect(client.auth).toBeTruthy()
  })

  it('should create client even if environment variables are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const client = createClient()
    expect(client).toBeTruthy()
  })
})
