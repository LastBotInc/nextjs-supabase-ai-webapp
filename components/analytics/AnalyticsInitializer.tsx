'use client'

import { useEffect, useRef } from 'react'
import { initAnalytics, trackPageView, setupAutoTracking } from '@/lib/analytics'
import { useDedupingEffect } from '@/lib/utils/deduplication'

export default function AnalyticsInitializer() {
  const isInitialized = useRef(false)
  const isAutoTrackingSetup = useRef(false)

  // Use dedupingEffect for initialization
  useDedupingEffect(() => {
    if (isInitialized.current) return

    const initialize = async () => {
      try {
        await initAnalytics()
        isInitialized.current = true
        
        // Track initial page view
        await trackPageView()

        // Setup auto-tracking for interactions
        if (!isAutoTrackingSetup.current) {
          setupAutoTracking()
          isAutoTrackingSetup.current = true
        }

        // Setup page view tracking for route changes
        const handleRouteChange = () => {
          if (isInitialized.current) {
            trackPageView().catch(console.error)
          }
        }

        // Add route change listener
        window.addEventListener('popstate', handleRouteChange)
        
        // Track navigation API changes (for SPA routing)
        const originalPushState = history.pushState
        const originalReplaceState = history.replaceState

        history.pushState = function(...args) {
          originalPushState.apply(history, args)
          setTimeout(() => handleRouteChange(), 0)
        }

        history.replaceState = function(...args) {
          originalReplaceState.apply(history, args)
          setTimeout(() => handleRouteChange(), 0)
        }
        
        // Cleanup
        return () => {
          window.removeEventListener('popstate', handleRouteChange)
          history.pushState = originalPushState
          history.replaceState = originalReplaceState
        }
      } catch (error) {
        console.error('Analytics initialization failed:', error)
      }
    }

    initialize()
  }, []) // Empty deps since we want this to run once

  return null
} 