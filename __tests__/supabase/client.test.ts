/// <reference types="jest" />
import { createClient } from '@/utils/supabase/client'
import '@testing-library/jest-dom'

// Mock @supabase/ssr
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn()
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
    jest.clearAllMocks()
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
