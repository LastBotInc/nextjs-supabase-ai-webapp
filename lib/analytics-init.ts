'use client'

import { initAnalytics } from './analytics'

export async function initializeAnalytics() {
  try {
    await initAnalytics()
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics initialization failed:', error)
    }
  }
}