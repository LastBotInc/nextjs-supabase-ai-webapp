'use client'

import { v4 as uuidv4 } from 'uuid'
import { UAParser } from 'ua-parser-js'
import { createClient } from '@/utils/supabase/client'
import { dedupingFetch } from '@/lib/utils/deduplication'
import { getGeographicData, type GeographicData } from './geographic-analytics'

// Global flag to track initialization
let isInitialized = false
let initializationPromise: Promise<void> | null = null

// Cache for pending events to prevent duplicates
const pendingEvents = new Map<string, Promise<void>>()

// Enhanced event tracking
let pageStartTime = Date.now()
let scrollDepth = 0
let isPageVisible = true

// Types
export interface AnalyticsEvent {
  event_type: string
  event_category?: string
  event_action?: string
  event_label?: string
  page_url: string
  page_title?: string
  session_id: string
  locale: string
  user_id?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  device_type?: string
  browser?: string
  os?: string
  screen_resolution?: string
  country?: string
  region?: string
  city?: string
  timezone?: string
  scroll_depth?: number
  time_on_page?: number
  is_bounce?: boolean
  page_load_time?: number
  connection_type?: string
  custom_dimensions?: Record<string, any>
  custom_metrics?: Record<string, number>
  transaction_id?: string
  revenue?: number
  currency?: string
  items?: Array<{
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
  }>
}

export interface AnalyticsSession {
  id: string
  first_page: string
  user_id?: string
  referrer?: string
  user_agent?: string
  device_type?: string
  browser?: string
  os?: string
  screen_resolution?: string
  country?: string
  region?: string
  city?: string
  timezone?: string
  session_duration?: number
  page_views?: number
  is_engaged?: boolean
  engagement_score?: number
}

interface DeviceInfo {
  user_agent?: string
  device_type?: string
  browser?: string
  os?: string
  screen_resolution?: string
  connection_type?: string
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
  const sessionId = uuidv4()
  localStorage.setItem('analytics_session_id', sessionId)
  localStorage.setItem('analytics_session_timestamp', Date.now().toString())
  return sessionId
}

// Enhanced device info detection
const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {}
  }

  const parser = new UAParser(window.navigator.userAgent)
  const result = parser.getResult()
  
  // Get connection type if available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  
  return {
    user_agent: window.navigator.userAgent,
    device_type: result.device.type || 'desktop',
    browser: result.browser.name || 'unknown',
    os: result.os.name || 'unknown',
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    connection_type: connection?.effectiveType || 'unknown'
  }
}

// Get user's timezone
const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

/**
 * Enhanced analytics initialization with geographic tracking
 */
export async function initializeAnalytics(): Promise<void> {
  try {
    // Use existing session initialization
    const sessionId = getSessionId()
    
    // Collect geographic data
    await collectGeographicData()
    
    // Track initial page view using existing function
    await trackPageView()
    
    // Set up auto-tracking using existing function
    setupAutoTracking()
    
    console.log('Analytics initialized with geographic tracking')
  } catch (error) {
    console.error('Failed to initialize analytics:', error)
  }
}

/**
 * Collect and store geographic data
 */
async function collectGeographicData(): Promise<void> {
  try {
    // Check if we already have geographic data for this session
    const existingGeoData = sessionStorage.getItem('analytics_geo_data')
    
    if (existingGeoData) {
      console.log('Geographic data already collected for this session')
      return
    }
    
    // Collect geographic data via API
    const response = await fetch('/api/analytics/geographic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_url: window.location.pathname,
        timestamp: new Date().toISOString()
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      
      if (result.success) {
        // Store geographic data in session storage
        sessionStorage.setItem('analytics_geo_data', JSON.stringify(result.data))
        
        // Update global analytics context
        updateAnalyticsContext(result.data)
        
        console.log('Geographic data collected:', result.data)
      }
    } else {
      console.warn('Failed to collect geographic data:', response.status)
    }
  } catch (error) {
    console.error('Error collecting geographic data:', error)
  }
}

/**
 * Update analytics context with geographic data
 */
function updateAnalyticsContext(geoData: GeographicData): void {
  // Store in global context for use in other tracking calls
  if (typeof window !== 'undefined') {
    (window as any).analyticsGeoData = geoData
  }
}

/**
 * Get geographic data from context
 */
function getGeographicContext(): Partial<GeographicData> | null {
  if (typeof window === 'undefined') return null
  
  const storedData = sessionStorage.getItem('analytics_geo_data')
  if (storedData) {
    try {
      return JSON.parse(storedData)
    } catch {
      return null
    }
  }
  
  return (window as any).analyticsGeoData || null
}

// Enhanced event tracking with scroll depth and time on page
export const trackEvent = async (
  eventType: string, 
  metadata: Record<string, unknown> = {},
  eventCategory?: string,
  eventAction?: string,
  eventLabel?: string
) => {
  try {
    // Create a unique key for this event
    const eventKey = `${eventType}-${eventCategory}-${eventAction}-${JSON.stringify(metadata)}-${Date.now()}`
    
    // Check if this exact event is already being processed
    if (pendingEvents.has(eventKey)) {
      return pendingEvents.get(eventKey)
    }

    const eventPromise = (async () => {
      const supabase = createClient()
      const sessionId = getSessionId()
      const deviceInfo = getDeviceInfo()
      const { data: { session } } = await supabase.auth.getSession()
      const geoData = getGeographicContext()

      // Calculate time on page for page view events
      let timeOnPage: number | undefined
      if (eventType === 'page_view' || eventType === 'page_exit') {
        timeOnPage = Math.round((Date.now() - pageStartTime) / 1000)
      }

      // Enhance metadata with geographic data
      const enhancedMetadata = {
        ...metadata,
        ...(geoData && {
          geographic_country: geoData.country,
          geographic_region: geoData.region,
          geographic_city: geoData.city,
          geographic_timezone: geoData.timezone,
          geographic_language: geoData.preferredLanguage,
          geographic_continent: geoData.continent,
          geographic_marketing_region: geoData.marketingRegion,
          geographic_currency: geoData.currency,
          geographic_is_eu: geoData.isEU,
          geographic_is_gdpr: geoData.isGDPRRegion
        })
      }

      const event: AnalyticsEvent = {
        event_type: eventType,
        event_category: eventCategory,
        event_action: eventAction,
        event_label: eventLabel,
        page_url: window.location.pathname,
        page_title: document.title,
        session_id: sessionId,
        locale: navigator.language,
        user_id: session?.user?.id,
        referrer: document.referrer,
        timezone: getUserTimezone(),
        scroll_depth: scrollDepth,
        time_on_page: timeOnPage,
        custom_dimensions: (metadata.dimensions as Record<string, any>) || enhancedMetadata,
        custom_metrics: (metadata.metrics as Record<string, number>) || {},
        transaction_id: metadata.transaction_id as string,
        revenue: metadata.revenue as number,
        currency: (metadata.currency as string) || 'EUR',
        items: metadata.items as any[],
        // Add geographic data directly to event
        ...(geoData && {
          country: geoData.country,
          region: geoData.region,
          city: geoData.city,
          browser_language: geoData.browserLanguage
        }),
        ...deviceInfo
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

// Specific event tracking functions
export const trackPageView = async (customData?: Record<string, unknown>) => {
  pageStartTime = Date.now()
  scrollDepth = 0
  
  const geoData = getGeographicContext()
  const enhancedData = {
    ...customData,
    url: window.location.pathname,
    title: document.title,
    page_load_time: (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.loadEventEnd || 0,
    ...(geoData && {
      geographic_country: geoData.country,
      geographic_region: geoData.region,
      geographic_city: geoData.city,
      geographic_language: geoData.preferredLanguage,
      geographic_marketing_region: geoData.marketingRegion
    })
  }
  return trackEvent('page_view', enhancedData, 'navigation', 'page_view')
}

export const trackClick = async (element: string, label?: string, customData?: Record<string, unknown>) => {
  const geoData = getGeographicContext()
  const enhancedData = {
    ...customData,
    element,
    ...(geoData && {
      geographic_country: geoData.country,
      geographic_language: geoData.preferredLanguage
    })
  }
  return trackEvent('click', enhancedData, 'engagement', 'click', label || element)
}

export const trackFormSubmit = async (formName: string, success: boolean = true, customData?: Record<string, unknown>) => {
  const geoData = getGeographicContext()
  const enhancedData = {
    ...customData,
    form_name: formName,
    success,
    ...(geoData && {
      geographic_country: geoData.country,
      geographic_language: geoData.preferredLanguage
    })
  }
  return trackEvent('form_submit', enhancedData, 'conversion', success ? 'form_submit_success' : 'form_submit_error', formName)
}

export const trackDownload = async (fileName: string, fileType: string, customData?: Record<string, unknown>) => {
  const geoData = getGeographicContext()
  const enhancedData = {
    ...customData,
    file_name: fileName,
    file_type: fileType,
    ...(geoData && {
      geographic_country: geoData.country,
      geographic_language: geoData.preferredLanguage
    })
  }
  return trackEvent('download', enhancedData, 'engagement', 'download', fileName)
}

export const trackVideoPlay = async (videoTitle: string, duration?: number, customData?: Record<string, unknown>) => {
  const geoData = getGeographicContext()
  const enhancedData = {
    ...customData,
    video_title: videoTitle,
    duration,
    ...(geoData && {
      geographic_country: geoData.country,
      geographic_language: geoData.preferredLanguage
    })
  }
  return trackEvent('video_play', enhancedData, 'engagement', 'video_play', videoTitle)
}

export const trackSearch = async (searchTerm: string, resultsCount?: number, customData?: Record<string, unknown>) => {
  return trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    ...customData
  }, 'engagement', 'search', searchTerm)
}

export const trackPurchase = async (
  transactionId: string,
  revenue: number,
  currency: string = 'EUR',
  items: Array<{
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
  }>,
  customData?: Record<string, unknown>
) => {
  return trackEvent('purchase', {
    transaction_id: transactionId,
    revenue,
    currency,
    items,
    ...customData
  }, 'conversion', 'purchase', transactionId)
}

export const trackCustomEvent = async (
  eventType: string,
  category: string,
  action: string,
  label?: string,
  customData?: Record<string, unknown>
) => {
  return trackEvent(eventType, customData, category, action, label)
}

// Initialize analytics with enhanced tracking
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
        timezone: getUserTimezone(),
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

      // Set up enhanced tracking
      setupScrollTracking()
      setupVisibilityTracking()
      setupUnloadTracking()

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

// Scroll depth tracking
function setupScrollTracking() {
  if (typeof window === 'undefined') return

  let maxScroll = 0
  
  const updateScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const currentScroll = Math.round((scrollTop / documentHeight) * 100)
    
    if (currentScroll > maxScroll) {
      maxScroll = currentScroll
      scrollDepth = Math.min(maxScroll, 100)
      
      // Track milestone scroll events
      if (scrollDepth >= 25 && scrollDepth < 50 && maxScroll >= 25) {
        trackEvent('scroll', { depth: 25 }, 'engagement', 'scroll_depth', '25%')
      } else if (scrollDepth >= 50 && scrollDepth < 75 && maxScroll >= 50) {
        trackEvent('scroll', { depth: 50 }, 'engagement', 'scroll_depth', '50%')
      } else if (scrollDepth >= 75 && scrollDepth < 100 && maxScroll >= 75) {
        trackEvent('scroll', { depth: 75 }, 'engagement', 'scroll_depth', '75%')
      } else if (scrollDepth >= 100 && maxScroll >= 100) {
        trackEvent('scroll', { depth: 100 }, 'engagement', 'scroll_depth', '100%')
      }
    }
  }

  window.addEventListener('scroll', updateScrollDepth, { passive: true })
}

// Page visibility tracking
function setupVisibilityTracking() {
  if (typeof window === 'undefined') return

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden
    
    if (document.hidden) {
      trackEvent('page_hidden', {}, 'engagement', 'visibility', 'hidden')
    } else {
      trackEvent('page_visible', {}, 'engagement', 'visibility', 'visible')
    }
  })
}

// Track page unload/exit
function setupUnloadTracking() {
  if (typeof window === 'undefined') return

  const handleUnload = () => {
    const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000)
    
    // Use sendBeacon for reliable tracking on page unload
    const event = {
      event_type: 'page_exit',
      event_category: 'navigation',
      event_action: 'page_exit',
      page_url: window.location.pathname,
      page_title: document.title,
      session_id: getSessionId(),
      time_on_page: timeOnPage,
      scroll_depth: scrollDepth,
      locale: navigator.language,
      timezone: getUserTimezone(),
      ...getDeviceInfo()
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/events', JSON.stringify(event))
    }
  }

  window.addEventListener('beforeunload', handleUnload)
  window.addEventListener('pagehide', handleUnload)
}

// Auto-track common interactions
export function setupAutoTracking() {
  if (typeof window === 'undefined') return

  // Track clicks on links
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const link = target.closest('a')
    
    if (link) {
      const href = link.getAttribute('href')
      const text = link.textContent?.trim() || 'unknown'
      
      if (href?.startsWith('http') && !href.includes(window.location.hostname)) {
        // External link
        trackClick('external_link', text, { url: href })
      } else if (href?.startsWith('mailto:')) {
        // Email link
        trackClick('email_link', text, { email: href.replace('mailto:', '') })
      } else if (href?.startsWith('tel:')) {
        // Phone link
        trackClick('phone_link', text, { phone: href.replace('tel:', '') })
      }
    }
    
    // Track button clicks
    const button = target.closest('button')
    if (button) {
      const text = button.textContent?.trim() || 'unknown'
      const type = button.getAttribute('type') || 'button'
      trackClick('button', text, { button_type: type })
    }
  })

  // Track form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement
    const formName = form.getAttribute('name') || form.getAttribute('id') || 'unknown'
    trackFormSubmit(formName, true)
  })
} 