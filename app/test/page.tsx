'use client'

import * as React from 'react'
import { initializeAnalytics } from '@/lib/analytics-init'

export const dynamic = 'force-dynamic'

export default function TestPage() {
  React.useEffect(() => {
    const init = async () => {
      try {
        console.log('Test page: Initializing analytics...')
        await initializeAnalytics()
        console.log('Test page: Analytics initialized')
      } catch (error) {
        console.error('Test page: Analytics initialization failed:', error)
      }
    }
    init()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Test Page</h1>
      <p>Open the browser console to see analytics initialization logs.</p>
      <p className="mt-2 text-gray-600">This page is used to test analytics tracking.</p>
    </div>
  )
} 