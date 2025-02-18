/// <reference types="jest" />

import { expect } from '@jest/globals'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import { trackEvent, initSession, trackPageView, initAnalytics } from '@/lib/analytics'
import { createClient } from '@/utils/supabase/client'

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => {
  const mockFrom = jest.fn()
  const mockInsert = jest.fn(() => Promise.resolve({ data: null, error: null }))
  const mockUpsert = jest.fn(() => Promise.resolve({ data: null, error: null }))

  mockFrom.mockReturnValue({
    insert: mockInsert,
    upsert: mockUpsert
  })

  return {
    createClient: jest.fn(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null }))
      },
      from: mockFrom
    }))
  }
})

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

describe('Analytics Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('trackEvent', () => {
    it('should track an event with correct data', async () => {
      const eventType = 'test_event'
      const metadata = { test: 'data' }
      const supabase = createClient()

      await trackEvent(eventType, metadata)

      expect(supabase.from).toHaveBeenCalledWith('analytics_events')
      expect(supabase.from('analytics_events').insert).toHaveBeenCalledWith([
        expect.objectContaining({
          event_type: eventType,
          metadata
        })
      ])
    })

    it('should handle errors gracefully', async () => {
      const error = new Error('Test error')
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const supabase = createClient()
      ;(supabase.from('analytics_events').insert as jest.Mock).mockRejectedValueOnce(error)

      await trackEvent('test_event')

      expect(consoleSpy).toHaveBeenCalledWith('Error tracking event:', error)
      consoleSpy.mockRestore()
    })
  })

  describe('initSession', () => {
    it('should initialize a session with correct data', async () => {
      const supabase = createClient()
      mockLocalStorage.getItem.mockReturnValue('test-session-id')

      await initSession()

      expect(supabase.from).toHaveBeenCalledWith('analytics_sessions')
      expect(supabase.from('analytics_sessions').upsert).toHaveBeenCalledWith([{
        id: 'test-session-id',
        first_page: '/',
        user_id: 'test-user',
        referrer: undefined,
        user_agent: 'Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/20.0.3',
        device_type: 'desktop'
      }])
    })

    it('should create a new session ID if none exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      await initSession()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'analytics_session_id',
        expect.any(String)
      )
    })
  })

  describe('trackPageView', () => {
    it('should track a page view event', async () => {
      const supabase = createClient()
      mockLocalStorage.getItem.mockReturnValue('test-session-id')

      await trackPageView()

      expect(supabase.from).toHaveBeenCalledWith('analytics_events')
      expect(supabase.from('analytics_events').insert).toHaveBeenCalledWith([
        expect.objectContaining({
          event_type: 'page_view',
          session_id: 'test-session-id'
        })
      ])
    })
  })

  describe('initAnalytics', () => {
    it('should initialize session and track page view', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-session-id')

      await initAnalytics()

      const supabase = createClient()
      expect(supabase.from).toHaveBeenCalledWith('analytics_sessions')
      expect(supabase.from).toHaveBeenCalledWith('analytics_events')
    })
  })
}) 