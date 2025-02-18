'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, LineChart } from '@/components/ui/charts'
import { trackPageView } from '@/lib/analytics'
import ClientTabs from './tabs'

interface ChartData {
  name: string
  value: number
}

interface AnalyticsData {
  pageViews: ChartData[]
  topPages: ChartData[]
  activeSessions: number
  translations: {
    title: string
    pageViews: string
    topPages: string
  }
}

export default function AnalyticsClient({ pageViews, topPages, activeSessions, translations }: AnalyticsData) {
  // Track page view when component mounts
  useEffect(() => {
    trackPageView().catch(console.error)
  }, [])

  const pageViewsCard = (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-white">Page Views (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart data={pageViews} />
      </CardContent>
    </Card>
  )

  const topPagesCard = (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-white">Top Pages (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart data={topPages} />
      </CardContent>
    </Card>
  )

  const activeSessionsCard = (
    <Card>
      <CardHeader>
        <CardTitle className="dark:text-white">Active Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold dark:text-white">{activeSessions}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 dark:text-white">{translations.title}</h1>
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {activeSessionsCard}
      </div>

      <ClientTabs 
        pageViews={pageViewsCard}
        topPages={topPagesCard}
        translations={{
          pageViews: translations.pageViews,
          topPages: translations.topPages
        }}
      />
    </div>
  )
} 