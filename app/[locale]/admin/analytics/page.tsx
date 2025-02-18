import { Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { getPageViews, getTopPages, getActiveSessions } from './services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, LineChart } from '@/components/ui/charts'
import { Skeleton } from '@/components/ui/skeleton'
import ClientTabs from './tabs'

// Async components
async function PageViewsCard() {
  const data = await getPageViews()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Views (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div data-testid="page-views-chart">
          <LineChart data={data} />
        </div>
      </CardContent>
    </Card>
  )
}

async function TopPagesCard() {
  const data = await getTopPages()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pages (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div data-testid="top-pages-chart">
          <BarChart data={data} />
        </div>
      </CardContent>
    </Card>
  )
}

async function ActiveSessionsCard() {
  const count = await getActiveSessions()
  
  return (
    <Card data-testid="active-sessions-card">
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{count}</div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsDashboard() {
  const t = useTranslations('Admin.analytics')

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 dark:text-white">{t('title')}</h1>
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Suspense fallback={<div data-testid="active-sessions-loading"><Skeleton className="h-[200px]" /></div>}>
          <ActiveSessionsCard />
        </Suspense>
      </div>

      <ClientTabs 
        pageViews={
          <Suspense fallback={<div data-testid="page-views-loading"><Skeleton className="h-[400px]" /></div>}>
            <PageViewsCard />
          </Suspense>
        }
        topPages={
          <Suspense fallback={<div data-testid="top-pages-loading"><Skeleton className="h-[400px]" /></div>}>
            <TopPagesCard />
          </Suspense>
        }
        translations={{
          pageViews: t('tabs.pageViews'),
          topPages: t('tabs.topPages')
        }}
      />
    </div>
  )
} 