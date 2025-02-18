import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export interface ChartData {
  name: string
  value: number
}

export async function getPageViews() {
  const { data: dailyViews } = await supabase
    .from('analytics_events')
    .select('created_at')
    .eq('event_type', 'page_view')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at')

  const viewsByDay = dailyViews?.reduce((acc, { created_at }) => {
    const date = new Date(created_at).toLocaleDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return Object.entries(viewsByDay).map(([date, count]) => ({
    name: date,
    value: count
  }))
}

export async function getTopPages() {
  const { data: pages } = await supabase
    .from('analytics_events')
    .select('page_url')
    .eq('event_type', 'page_view')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const pageViews = pages?.reduce((acc, { page_url }) => {
    acc[page_url] = (acc[page_url] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return Object.entries(pageViews)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, views]) => ({
      name: page,
      value: views
    }))
}

export async function getActiveSessions() {
  const { data: sessions } = await supabase
    .from('analytics_sessions')
    .select('*')
    .gte('last_seen_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())

  return sessions?.length || 0
} 