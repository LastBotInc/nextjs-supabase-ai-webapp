'use client'

import { v4 as uuidv4 } from 'uuid'
import { UAParser } from 'ua-parser-js'
import { createClient } from '@/utils/supabase/client'
import { dedupingFetch } from '@/lib/utils/deduplication'

// Global flag to track initialization
let isInitialized = false
let initializationPromise: Promise<void> | null = null

// Cache for pending events to prevent duplicates
const pendingEvents = new Map<string, Promise<void>>()

// Types
export interface AnalyticsEvent {
  event_type: string
  page_url: string
  session_id: string
  locale: string
  user_id?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  device_type?: string
  country?: string
  city?: string
  metadata?: Record<string, unknown>
}

export interface AnalyticsSession {
  id: string
  first_page: string
  user_id?: string
  referrer?: string
  user_agent?: string
  device_type?: string
  country?: string
  city?: string
}

interface DeviceInfo {
  user_agent?: string
  device_type?: string
}

// Get or create session ID from localStorage with expiration
const getSessionId = () => {
  if (typeof window === 'undefined') {
    return uuidv4()
  }
  
  const sessionId = localStorage.getItem('analytics_session_id')
  const sessionTimestamp = localStorage.getItem('analytics_session_timestamp')
  const SESSION_EXPIRY = 30 * 60 * 1000 // 30 minutes

  // Check if session is expired
  if (sessionTimestamp && Date.now() - parseInt(sessionTimestamp) > SESSION_EXPIRY) {
    localStorage.removeItem('analytics_session_id')
    localStorage.removeItem('analytics_session_timestamp')
    return createNewSession()
  }
  
  if (!sessionId) {
    return createNewSession()
  }

  // Update timestamp
  localStorage.setItem('analytics_session_timestamp', Date.now().toString())
  return sessionId
}

const createNewSession = () => {
  const newSessionId = uuidv4()
  localStorage.setItem('analytics_session_id', newSessionId)
  localStorage.setItem('analytics_session_timestamp', Date.now().toString())
  return newSessionId
}

// Get device info using UA Parser
const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {}
  }

  const parser = new UAParser(window.navigator.userAgent)
  const result = parser.getResult()
  
  return {
    user_agent: window.navigator.userAgent,
    device_type: result.device.type || 'desktop'
  }
}

// Track an analytics event with deduplication
export const trackEvent = async (eventType: string, metadata: Record<string, unknown> = {}) => {
  try {
    // Create a unique key for this event
    const eventKey = `${eventType}-${JSON.stringify(metadata)}-${Date.now()}`
    
    // Check if this exact event is already being processed
    if (pendingEvents.has(eventKey)) {
      return pendingEvents.get(eventKey)
    }

    const eventPromise = (async () => {
      const supabase = createClient()
      const sessionId = getSessionId()
      const deviceInfo = getDeviceInfo()
      const { data: { session } } = await supabase.auth.getSession()

      const event: AnalyticsEvent = {
        event_type: eventType,
        page_url: window.location.pathname,
        session_id: sessionId,
        locale: navigator.language,
        user_id: session?.user?.id,
        referrer: document.referrer,
        ...deviceInfo,
        metadata
      }

      // Use dedupingFetch for the API call
      await dedupingFetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })
    })()

    // Store the promise and clean it up when done
    pendingEvents.set(eventKey, eventPromise)
    eventPromise.finally(() => {
      pendingEvents.delete(eventKey)
    })

    return eventPromise
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in trackEvent:', error)
    }
  }
}

// Initialize analytics with deduplication
export async function initAnalytics() {
  // Return existing initialization if in progress
  if (initializationPromise) {
    return initializationPromise
  }

  // Return early if already initialized
  if (isInitialized) {
    return
  }

  initializationPromise = (async () => {
    try {
      const sessionId = getSessionId()
      const deviceInfo = getDeviceInfo()
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const analyticsSession: AnalyticsSession = {
        id: sessionId,
        first_page: window.location.pathname,
        user_id: session?.user?.id,
        referrer: document.referrer,
        ...deviceInfo
      }

      // Use dedupingFetch for session initialization
      await dedupingFetch('/api/analytics/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsSession)
      })

      isInitialized = true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error initializing analytics:', error)
      }
    } finally {
      initializationPromise = null
    }
  })()

  return initializationPromise
}

// Track page view with deduplication
export const trackPageView = async () => {
  return trackEvent('page_view', {
    url: window.location.pathname,
    title: document.title
  })
} 