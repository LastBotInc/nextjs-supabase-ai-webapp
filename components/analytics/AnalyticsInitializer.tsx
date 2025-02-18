'use client'

import { useEffect, useRef } from 'react'
import { initAnalytics, trackPageView } from '@/lib/analytics'
import { useDedupingEffect } from '@/lib/utils/deduplication'

export default function AnalyticsInitializer() {
  const isInitialized = useRef(false)

  // Use dedupingEffect for initialization
  useDedupingEffect(() => {
    if (isInitialized.current) return

    const initialize = async () => {
      try {
        await initAnalytics()
        isInitialized.current = true
        
        // Track initial page view
        await trackPageView()

        // Setup page view tracking for route changes
        const handleRouteChange = () => {
          if (isInitialized.current) {
            trackPageView().catch(console.error)
          }
        }

        // Add route change listener
        window.addEventListener('popstate', handleRouteChange)
        
        // Cleanup
        return () => {
          window.removeEventListener('popstate', handleRouteChange)
        }
      } catch (error) {
        console.error('Analytics initialization failed:', error)
      }
    }

    initialize()
  }, []) // Empty deps since we want this to run once

  return null
} 