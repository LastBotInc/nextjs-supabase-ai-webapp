import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { 
  parseUserAgent, 
  calculateUserAgentInsights,
  getSimplifiedBrowserName,
  getSimplifiedOSName,
  type UserAgentAnalytics,
  type UserAgentInsights
} from '@/lib/user-agent-parser'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '7d'
    const action = searchParams.get('action')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1)
        break
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
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    if (action === 'parse') {
      return await parseAndUpdateUserAgents(supabase, startDate, endDate)
    }

    // Get analytics events with user agent data
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('user_agent, browser, os, device_type, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('user_agent', 'is', null)

    if (error) {
      console.error('Error fetching user agent data:', error)
      return NextResponse.json({ error: 'Failed to fetch user agent data' }, { status: 500 })
    }

    // Parse user agents if not already parsed
    const userAgents: UserAgentAnalytics[] = events.map((event: any) => {
      if (event.browser && event.os && event.device_type) {
        // Use existing parsed data
        return {
          browser: event.browser,
          browserVersion: 'Unknown',
          browserMajor: 'Unknown',
          os: event.os,
          osVersion: 'Unknown',
          deviceType: event.device_type,
          deviceVendor: 'Unknown',
          deviceModel: 'Unknown',
          engine: 'Unknown',
          engineVersion: 'Unknown',
          cpuArchitecture: 'Unknown',
          isMobile: event.device_type === 'mobile',
          isTablet: event.device_type === 'tablet',
          isDesktop: event.device_type === 'desktop',
          isBot: false
        }
      } else {
        // Parse the user agent string
        return parseUserAgent(event.user_agent)
      }
    })

    // Calculate insights
    const insights = calculateUserAgentInsights(userAgents)

    // Group data for charts
    const browserStats = userAgents.reduce((acc, ua) => {
      const browser = getSimplifiedBrowserName(ua.browser)
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const osStats = userAgents.reduce((acc, ua) => {
      const os = getSimplifiedOSName(ua.os)
      acc[os] = (acc[os] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const deviceStats = userAgents.reduce((acc, ua) => {
      acc[ua.deviceType] = (acc[ua.deviceType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Convert to chart format
    const browserData = Object.entries(browserStats)
      .map(([browser, count]) => ({
        name: browser,
        value: count,
        percentage: (count / userAgents.length) * 100
      }))
      .sort((a, b) => b.value - a.value)

    const osData = Object.entries(osStats)
      .map(([os, count]) => ({
        name: os,
        value: count,
        percentage: (count / userAgents.length) * 100
      }))
      .sort((a, b) => b.value - a.value)

    const deviceData = Object.entries(deviceStats)
      .map(([device, count]) => ({
        name: device,
        value: count,
        percentage: (count / userAgents.length) * 100
      }))
      .sort((a, b) => b.value - a.value)

    // Browser version analysis
    const browserVersions = userAgents.reduce((acc, ua) => {
      if (ua.browser !== 'Unknown' && ua.browserMajor !== 'Unknown') {
        const key = `${ua.browser} ${ua.browserMajor}`
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const browserVersionData = Object.entries(browserVersions)
      .map(([version, count]) => ({
        name: version,
        value: count,
        percentage: (count / userAgents.length) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 browser versions

    // Time series data (daily breakdown)
    const timeSeriesMap = new Map<string, { browsers: Set<string>; devices: Set<string>; total: number }>()
    
    events.forEach((event: { created_at: string; user_agent: string }) => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, { browsers: new Set(), devices: new Set(), total: 0 })
      }
      const dayData = timeSeriesMap.get(date)!
      
      const ua = parseUserAgent(event.user_agent)
      dayData.browsers.add(ua.browser)
      dayData.devices.add(ua.deviceType)
      dayData.total++
    })

    const timeSeriesData = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({
        date,
        uniqueBrowsers: data.browsers.size,
        uniqueDevices: data.devices.size,
        totalRequests: data.total
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      insights,
      browserData,
      osData,
      deviceData,
      browserVersionData,
      timeSeriesData,
      rawUserAgents: userAgents.slice(0, 100), // Sample for debugging
      totalEvents: events.length
    })

  } catch (error) {
    console.error('Error in user agent analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function parseAndUpdateUserAgents(supabase: any, startDate: Date, endDate: Date) {
  try {
    // Get events that need parsing (where browser/os/device_type are null)
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('id, user_agent')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('user_agent', 'is', null)
      .or('browser.is.null,os.is.null')

    if (error) {
      console.error('Error fetching events for parsing:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ 
        message: 'No events need parsing',
        updated: 0 
      })
    }

    // Parse and update in batches
    const batchSize = 100
    let updated = 0

    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize)
      
      const updates = batch.map((event: any) => {
        const parsed = parseUserAgent(event.user_agent)
        return {
          id: event.id,
          browser: getSimplifiedBrowserName(parsed.browser),
          os: getSimplifiedOSName(parsed.os),
          device_type: parsed.deviceType,
          browser_version: parsed.browserVersion,
          os_version: parsed.osVersion,
          device_vendor: parsed.deviceVendor,
          device_model: parsed.deviceModel,
          engine: parsed.engine,
          cpu_architecture: parsed.cpuArchitecture,
          is_bot: parsed.isBot
        }
      })

      // Update in batch
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('analytics_events')
          .update({
            browser: update.browser,
            os: update.os,
            device_type: update.device_type,
            browser_version: update.browser_version,
            os_version: update.os_version,
            device_vendor: update.device_vendor,
            device_model: update.device_model,
            engine: update.engine,
            cpu_architecture: update.cpu_architecture,
            is_bot: update.is_bot
          })
          .eq('id', update.id)

        if (!updateError) {
          updated++
        }
      }
    }

    return NextResponse.json({
      message: `Successfully parsed and updated ${updated} events`,
      updated,
      total: events.length
    })

  } catch (error) {
    console.error('Error parsing user agents:', error)
    return NextResponse.json({ error: 'Failed to parse user agents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userAgent } = await request.json()
    
    if (!userAgent) {
      return NextResponse.json({ error: 'User agent is required' }, { status: 400 })
    }

    const parsed = parseUserAgent(userAgent)
    
    return NextResponse.json({
      userAgent,
      parsed,
      formatted: `${parsed.browser} ${parsed.browserVersion} on ${parsed.os} ${parsed.osVersion} (${parsed.deviceType})`
    })

  } catch (error) {
    console.error('Error parsing user agent:', error)
    return NextResponse.json({ error: 'Failed to parse user agent' }, { status: 500 })
  }
} 