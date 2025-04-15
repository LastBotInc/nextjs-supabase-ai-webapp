/// <reference types="jest" />

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import { trackEvent, initAnalytics, trackPageView } from '@/lib/analytics'
import { createClient } from '@/utils/supabase/client'

// Mock dependencies
vi.mock('@/utils/supabase/client')
vi.mock('uuid', () => ({ v4: () => 'mock-uuid' }))
vi.mock('ua-parser-js', () => ({
  UAParser: vi.fn().mockImplementation(() => ({
    getResult: () => ({ device: { type: 'desktop' } })
  }))
}))

// Create a minimal browser-like environment for testing
const mockWindow = {
  location: {
    pathname: '/test-path',
    href: 'http://localhost/test-path'
  },
  navigator: {
    userAgent: 'test-agent',
    language: 'en-US'
  },
  document: {
    referrer: 'http://test-referrer.com',
    title: 'Test Page Title'
  },
  localStorage: {
    getItem: vi.fn().mockReturnValue('existing-session-id'),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
};

// Mock global fetch
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
);

// Mock browser environment globals needed by analytics library
beforeEach(() => {
  // Set the global window object
  global.window = mockWindow as any;

  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Setup Supabase auth mock
  vi.mocked(createClient).mockReturnValue({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } } })
    }
  } as any);
});

// Extend Jest matchers
declare global {
  namespace Vi {
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<typeof expect.stringContaining, unknown> {}
  }
}

describe('Analytics Library', () => {
  describe('initAnalytics', () => {
    it('initializes analytics with API call', async () => {
      await initAnalytics();
      
      // Only check that fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/sessions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('mock-uuid')
        })
      );
    });
  })

  describe('trackEvent', () => {
    it('tracks events with API call', async () => {
      const eventType = 'test_event';
      const metadata = { custom: 'data' };
      
      await trackEvent(eventType, metadata);

      // Verify fetch was called with correct data
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/events',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining(eventType)
        })
      );
    })
  })

  describe('trackPageView', () => {
    it('tracks page views with API call', async () => {
      await trackPageView();
      
      // Verify fetch was called with the correct event type and data
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/events',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('page_view')
        })
      );
    })
  })
}) 