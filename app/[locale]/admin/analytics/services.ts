import { createClient } from '@/utils/supabase/client'

export interface AnalyticsData {
  totalPageViews: number
  uniqueVisitors: number
  avgSessionDuration: number
  bounceRate: number
  topPages: Array<{ page: string; views: number; avg_time: number }>
  trafficSources: Array<{ source: string; visitors: number; percentage: number }>
  deviceTypes: Array<{ type: string; count: number; percentage: number }>
  browsers: Array<{ browser: string; count: number; percentage: number }>
  countries: Array<{ country: string; count: number; percentage: number }>
  timeSeriesData: Array<{ date: string; pageViews: number; uniqueVisitors: number; sessions: number }>
  realtimeData?: RealtimeAnalytics
}

export interface RealtimeAnalytics {
  timestamp: string
  metrics: {
    activeUsers: number
    uniqueUsers: number
    pageViews: number
    totalRevenue: number
    averageEngagementScore: number
  }
  events: {
    byType: Record<string, number>
    recent: Array<{
      event_type: string
      event_category?: string
      event_action?: string
      page_url: string
      page_title?: string
      created_at: string
      country?: string
      device_type?: string
      browser?: string
    }>
  }
  users: {
    byCountry: Array<{ country: string; count: number }>
    byDevice: Array<{ device: string; count: number }>
  }
  content: {
    topPages: Array<{ page: string; views: number }>
  }
  sessions: {
    active: Array<{
      id: string
      first_page: string
      country?: string
      device_type?: string
      browser?: string
      engagement_score?: number
      last_seen_at: string
    }>
    total: number
  }
}

export interface ConversionData {
  totalRevenue: number
  totalTransactions: number
  averageOrderValue: number
  conversionRate: number
  topProducts: Array<{ name: string; revenue: number; quantity: number }>
  revenueByDate: Array<{ date: string; revenue: number; transactions: number }>
}

export interface EngagementData {
  averageTimeOnPage: number
  averageScrollDepth: number
  engagementRate: number
  topEngagingPages: Array<{ page: string; avg_time: number; avg_scroll: number; engagement_score: number }>
  eventsByCategory: Record<string, number>
  interactionsByType: Record<string, number>
}

export async function getAnalyticsData(dateRange: string = '7d'): Promise<AnalyticsData> {
  const supabase = createClient()
  
  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  
  switch (dateRange) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24)
      break
    case '7d':
      startDate.setDate(startDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(startDate.getDate() - 90)
      break
    default:
      startDate.setDate(startDate.getDate() - 7)
  }

  try {
    // Get events data with enhanced properties
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select(`
        *,
        analytics_sessions!inner(
          id,
          session_duration,
          page_views,
          is_engaged,
          engagement_score
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      throw eventsError
    }

    // Get sessions data
    const { data: sessions, error: sessionsError } = await supabase
      .from('analytics_sessions')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      throw sessionsError
    }

    // Calculate metrics
    const totalPageViews = events?.filter(e => e.event_type === 'page_view').length || 0
    const uniqueVisitors = new Set(events?.map(e => e.session_id)).size
    const totalSessions = sessions?.length || 0
    
    // Average session duration
    const avgSessionDuration = sessions?.reduce((sum, s) => sum + (s.session_duration || 0), 0) / totalSessions || 0
    
    // Bounce rate (sessions with only 1 page view)
    const bouncedSessions = sessions?.filter(s => s.page_views === 1).length || 0
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0

    // Top pages with enhanced metrics
    const pageViews = events?.filter(e => e.event_type === 'page_view') || []
    const pageStats = pageViews.reduce((acc, event) => {
      const page = event.page_url
      if (!acc[page]) {
        acc[page] = { views: 0, totalTime: 0, count: 0 }
      }
      acc[page].views++
      if (event.time_on_page) {
        acc[page].totalTime += event.time_on_page
        acc[page].count++
      }
      return acc
    }, {} as Record<string, { views: number; totalTime: number; count: number }>)

    const topPages = Object.entries(pageStats)
      .map(([page, stats]) => ({
        page,
        views: stats.views,
        avg_time: stats.count > 0 ? stats.totalTime / stats.count : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Traffic sources
    const referrerStats = events?.reduce((acc, event) => {
      const source = event.referrer || 'Direct'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const totalReferrers = Object.values(referrerStats).reduce((sum, count) => sum + count, 0)
    const trafficSources = Object.entries(referrerStats)
      .map(([source, count]) => ({
        source,
        visitors: count,
        percentage: totalReferrers > 0 ? (count / totalReferrers) * 100 : 0
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10)

    // Device types
    const deviceStats = events?.reduce((acc, event) => {
      const device = event.device_type || 'Unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const totalDevices = Object.values(deviceStats).reduce((sum, count) => sum + count, 0)
    const deviceTypes = Object.entries(deviceStats)
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalDevices > 0 ? (count / totalDevices) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)

    // Browsers
    const browserStats = events?.reduce((acc, event) => {
      const browser = event.browser || 'Unknown'
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const totalBrowsers = Object.values(browserStats).reduce((sum, count) => sum + count, 0)
    const browsers = Object.entries(browserStats)
      .map(([browser, count]) => ({
        browser,
        count,
        percentage: totalBrowsers > 0 ? (count / totalBrowsers) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Countries
    const countryStats = events?.reduce((acc, event) => {
      const country = event.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const totalCountries = Object.values(countryStats).reduce((sum, count) => sum + count, 0)
    const countries = Object.entries(countryStats)
      .map(([country, count]) => ({
        country,
        count,
        percentage: totalCountries > 0 ? (count / totalCountries) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Time series data (daily aggregation)
    const timeSeriesMap = new Map<string, { pageViews: number; uniqueVisitors: Set<string>; sessions: Set<string> }>()
    
    events?.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, { pageViews: 0, uniqueVisitors: new Set(), sessions: new Set() })
      }
      const dayData = timeSeriesMap.get(date)!
      
      if (event.event_type === 'page_view') {
        dayData.pageViews++
      }
      if (event.user_id) {
        dayData.uniqueVisitors.add(event.user_id)
      }
      dayData.sessions.add(event.session_id)
    })

    const timeSeriesData = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({
        date,
        pageViews: data.pageViews,
        uniqueVisitors: data.uniqueVisitors.size,
        sessions: data.sessions.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalPageViews,
      uniqueVisitors,
      avgSessionDuration,
      bounceRate,
      topPages,
      trafficSources,
      deviceTypes,
      browsers,
      countries,
      timeSeriesData
    }
  } catch (error) {
    console.error('Error in getAnalyticsData:', error)
    throw error
  }
}

export async function getRealtimeAnalytics(): Promise<RealtimeAnalytics> {
  try {
    const response = await fetch('/api/analytics/realtime')
    if (!response.ok) {
      throw new Error('Failed to fetch real-time analytics')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching real-time analytics:', error)
    throw error
  }
}

export async function getConversionData(dateRange: string = '7d'): Promise<ConversionData> {
  const supabase = createClient()
  
  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  
  switch (dateRange) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24)
      break
    case '7d':
      startDate.setDate(startDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(startDate.getDate() - 90)
      break
    default:
      startDate.setDate(startDate.getDate() - 7)
  }

  try {
    // Get conversion events (purchases)
    const { data: conversions, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'purchase')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      console.error('Error fetching conversion data:', error)
      throw error
    }

    // Get total sessions for conversion rate
    const { data: sessions, error: sessionsError } = await supabase
      .from('analytics_sessions')
      .select('id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (sessionsError) {
      console.error('Error fetching sessions for conversion rate:', sessionsError)
      throw sessionsError
    }

    const totalRevenue = conversions?.reduce((sum, conv) => sum + (conv.revenue || 0), 0) || 0
    const totalTransactions = conversions?.length || 0
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const conversionRate = sessions?.length > 0 ? (totalTransactions / sessions.length) * 100 : 0

    // Top products from items data
    const productStats = conversions?.reduce((acc, conv) => {
      const items = conv.items || []
      items.forEach((item: any) => {
        if (!acc[item.item_name]) {
          acc[item.item_name] = { revenue: 0, quantity: 0 }
        }
        acc[item.item_name].revenue += item.price * item.quantity
        acc[item.item_name].quantity += item.quantity
      })
      return acc
    }, {} as Record<string, { revenue: number; quantity: number }>) || {}

    const topProducts = Object.entries(productStats)
      .map(([name, stats]) => ({
        name,
        revenue: stats.revenue,
        quantity: stats.quantity
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Revenue by date
    const revenueByDateMap = new Map<string, { revenue: number; transactions: number }>()
    
    conversions?.forEach(conv => {
      const date = new Date(conv.created_at).toISOString().split('T')[0]
      if (!revenueByDateMap.has(date)) {
        revenueByDateMap.set(date, { revenue: 0, transactions: 0 })
      }
      const dayData = revenueByDateMap.get(date)!
      dayData.revenue += conv.revenue || 0
      dayData.transactions++
    })

    const revenueByDate = Array.from(revenueByDateMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        transactions: data.transactions
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalRevenue,
      totalTransactions,
      averageOrderValue,
      conversionRate,
      topProducts,
      revenueByDate
    }
  } catch (error) {
    console.error('Error in getConversionData:', error)
    throw error
  }
}

export async function getEngagementData(dateRange: string = '7d'): Promise<EngagementData> {
  const supabase = createClient()
  
  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  
  switch (dateRange) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24)
      break
    case '7d':
      startDate.setDate(startDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(startDate.getDate() - 90)
      break
    default:
      startDate.setDate(startDate.getDate() - 7)
  }

  try {
    // Get all events for engagement analysis
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select(`
        *,
        analytics_sessions!inner(
          id,
          is_engaged,
          engagement_score
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      console.error('Error fetching engagement data:', error)
      throw error
    }

    // Calculate average time on page
    const timeOnPageEvents = events?.filter(e => e.time_on_page && e.time_on_page > 0) || []
    const averageTimeOnPage = timeOnPageEvents.length > 0 
      ? timeOnPageEvents.reduce((sum, e) => sum + e.time_on_page, 0) / timeOnPageEvents.length 
      : 0

    // Calculate average scroll depth
    const scrollEvents = events?.filter(e => e.scroll_depth && e.scroll_depth > 0) || []
    const averageScrollDepth = scrollEvents.length > 0
      ? scrollEvents.reduce((sum, e) => sum + e.scroll_depth, 0) / scrollEvents.length
      : 0

    // Engagement rate (percentage of engaged sessions)
    const uniqueSessions = new Set(events?.map(e => e.session_id))
    const engagedSessions = new Set(events?.filter(e => e.analytics_sessions?.is_engaged).map(e => e.session_id))
    const engagementRate = uniqueSessions.size > 0 ? (engagedSessions.size / uniqueSessions.size) * 100 : 0

    // Top engaging pages
    const pageEngagement = events?.reduce((acc, event) => {
      const page = event.page_url
      if (!acc[page]) {
        acc[page] = { timeSum: 0, scrollSum: 0, scoreSum: 0, count: 0 }
      }
      if (event.time_on_page) {
        acc[page].timeSum += event.time_on_page
        acc[page].count++
      }
      if (event.scroll_depth) {
        acc[page].scrollSum += event.scroll_depth
      }
      if (event.analytics_sessions?.engagement_score) {
        acc[page].scoreSum += event.analytics_sessions.engagement_score
      }
      return acc
    }, {} as Record<string, { timeSum: number; scrollSum: number; scoreSum: number; count: number }>) || {}

    const topEngagingPages = Object.entries(pageEngagement)
      .map(([page, stats]) => ({
        page,
        avg_time: stats.count > 0 ? stats.timeSum / stats.count : 0,
        avg_scroll: stats.count > 0 ? stats.scrollSum / stats.count : 0,
        engagement_score: stats.count > 0 ? stats.scoreSum / stats.count : 0
      }))
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 10)

    // Events by category
    const eventsByCategory = events?.reduce((acc, event) => {
      const category = event.event_category || 'uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Interactions by type
    const interactionsByType = events?.reduce((acc, event) => {
      const type = event.event_type
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return {
      averageTimeOnPage,
      averageScrollDepth,
      engagementRate,
      topEngagingPages,
      eventsByCategory,
      interactionsByType
    }
  } catch (error) {
    console.error('Error in getEngagementData:', error)
    throw error
  }
} 