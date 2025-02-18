'use client'

import dynamic from 'next/dynamic'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const AnalyticsScript = dynamic(
  () => import('@/components/analytics/AnalyticsScript'),
  { ssr: false }
)

export default function AnalyticsWrapper() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <AnalyticsScript />
    </>
  )
} 