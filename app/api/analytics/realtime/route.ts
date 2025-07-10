import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    console.log('\n📊 [GET /api/analytics/realtime]')
    
    // Create Supabase client
    const supabase = await createClient(undefined, true)

    // Get real-time analytics data (last 30 minutes)
    const { data: realtimeEvents, error: eventsError } = await supabase
      .from('analytics_realtime')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (eventsError) {
      console.error('❌ Error fetching real-time events:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch real-time events' },
        { status: 500 }
      )
    }

    // Get active sessions
    const { data: activeSessions, error: sessionsError } = await supabase
      .from('analytics_active_sessions')
      .select('*')
      .order('last_seen_at', { ascending: false })

    if (sessionsError) {
      console.error('❌ Error fetching active sessions:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch active sessions' },
        { status: 500 }
      )
    }

    // Calculate real-time metrics
    const activeUsersCount = activeSessions?.length || 0
    const uniqueUsers = new Set(realtimeEvents?.map(e => e.user_id).filter(Boolean)).size
    const pageViews = realtimeEvents?.filter(e => e.event_type === 'page_view').length || 0
    
    // Group events by type
    const eventsByType = realtimeEvents?.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Group by country
    const usersByCountry = realtimeEvents?.reduce((acc, event) => {
      if (event.country) {
        acc[event.country] = (acc[event.country] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    // Group by device type
    const usersByDevice = realtimeEvents?.reduce((acc, event) => {
      if (event.device_type) {
        acc[event.device_type] = (acc[event.device_type] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    // Top pages in real-time
    const topPages = realtimeEvents
      ?.filter(e => e.event_type === 'page_view')
      ?.reduce((acc, event) => {
        acc[event.page_url] = (acc[event.page_url] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

    const topPagesArray = Object.entries(topPages)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }))

    // Revenue in real-time
    const totalRevenue = realtimeEvents
      ?.filter(e => e.revenue && e.revenue > 0)
      ?.reduce((sum, event) => sum + (event.revenue || 0), 0) || 0

    const realtimeData = {
      timestamp: new Date().toISOString(),
      metrics: {
        activeUsers: activeUsersCount,
        uniqueUsers,
        pageViews,
        totalRevenue,
        averageEngagementScore: activeSessions?.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / (activeSessions?.length || 1)
      },
      events: {
        byType: eventsByType,
        recent: realtimeEvents?.slice(0, 20) || []
      },
      users: {
        byCountry: Object.entries(usersByCountry)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([country, count]) => ({ country, count })),
        byDevice: Object.entries(usersByDevice)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([device, count]) => ({ device, count }))
      },
      content: {
        topPages: topPagesArray
      },
      sessions: {
        active: activeSessions?.slice(0, 10) || [],
        total: activeUsersCount
      }
    }

    console.log('✅ Real-time analytics data fetched:', {
      activeUsers: activeUsersCount,
      events: realtimeEvents?.length || 0,
      sessions: activeSessions?.length || 0
    })

    return NextResponse.json(realtimeData)
  } catch (error) {
    console.error('❌ Error in real-time analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 