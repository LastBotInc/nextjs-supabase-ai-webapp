import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { 
  getGeographicData, 
  calculateGeographicInsights, 
  type GeographicData 
} from '@/lib/geographic-analytics'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const groupBy = searchParams.get('group_by') || 'country' // country, region, city, language, continent, marketing_region
    const limit = parseInt(searchParams.get('limit') || '100')
    
    // Build date filter
    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = `AND created_at >= '${startDate}' AND created_at <= '${endDate}'`
    } else if (startDate) {
      dateFilter = `AND created_at >= '${startDate}'`
    } else if (endDate) {
      dateFilter = `AND created_at <= '${endDate}'`
    }

    // Get geographic data from analytics events
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select(`
        id,
        created_at,
        country,
        region,
        city,
        timezone,
        language,
        browser_language,
        user_agent,
        ip_address
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    // Process events to get geographic insights
    const geographicData: GeographicData[] = []
    
    for (const event of events || []) {
      try {
        // For existing events, we might not have all geographic data
        // So we'll construct what we can from available data
        const geoData: GeographicData = {
          country: event.country || 'Unknown',
          countryCode: 'XX', // We'll need to enhance the database to store this
          region: event.region || 'Unknown',
          regionCode: 'XX',
          city: event.city || 'Unknown',
          latitude: null,
          longitude: null,
          timezone: event.timezone || 'UTC',
          browserLanguage: event.browser_language || event.language || 'en',
          browserLanguages: [event.browser_language || event.language || 'en'],
          acceptLanguage: event.language || 'en',
          preferredLanguage: event.language || 'en',
          continent: 'Unknown',
          currency: 'USD',
          isp: null,
          organization: null,
          asn: null,
          isEU: false,
          isGDPRRegion: false,
          marketingRegion: 'Unknown',
          languageFamily: 'Unknown'
        }
        
        geographicData.push(geoData)
      } catch (error) {
        console.warn('Error processing event:', error)
      }
    }

    // Calculate insights
    const insights = calculateGeographicInsights(geographicData)

    // Group data by requested parameter
    const groupedData = groupGeographicData(geographicData, groupBy)

    // Prepare chart data
    const chartData = Object.entries(groupedData)
      .map(([key, count]) => ({
        name: key,
        value: count,
        percentage: ((count / geographicData.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20) // Top 20 for charts

    return NextResponse.json({
      success: true,
      data: {
        insights,
        chartData,
        groupBy,
        totalEvents: geographicData.length,
        dateRange: {
          startDate,
          endDate
        }
      }
    })

  } catch (error) {
    console.error('Geographic analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip')
    
    // Get Accept-Language header
    const acceptLanguage = request.headers.get('accept-language')
    
    // Get comprehensive geographic data
    const geoData = await getGeographicData(ip || undefined, acceptLanguage || undefined)
    
    // Store or update geographic data for analytics
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'geographic_data',
        event_category: 'system',
        event_action: 'location_detected',
        page_url: body.page_url || '/',
        country: geoData.country,
        region: geoData.region,
        city: geoData.city,
        timezone: geoData.timezone,
        language: geoData.preferredLanguage,
        browser_language: geoData.browserLanguage,
        user_agent: request.headers.get('user-agent'),
        ip_address: ip,
        custom_dimensions: {
          countryCode: geoData.countryCode,
          regionCode: geoData.regionCode,
          continent: geoData.continent,
          currency: geoData.currency,
          marketingRegion: geoData.marketingRegion,
          languageFamily: geoData.languageFamily,
          isEU: geoData.isEU,
          isGDPRRegion: geoData.isGDPRRegion,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          isp: geoData.isp,
          organization: geoData.organization,
          asn: geoData.asn,
          browserLanguages: geoData.browserLanguages
        }
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to store geographic data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: geoData
    })

  } catch (error) {
    console.error('Geographic data collection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function groupGeographicData(data: GeographicData[], groupBy: string): Record<string, number> {
  const groups: Record<string, number> = {}
  
  data.forEach(item => {
    let key: string
    
    switch (groupBy) {
      case 'country':
        key = item.country
        break
      case 'region':
        key = item.region
        break
      case 'city':
        key = item.city
        break
      case 'language':
        key = item.preferredLanguage
        break
      case 'continent':
        key = item.continent
        break
      case 'marketing_region':
        key = item.marketingRegion
        break
      case 'language_family':
        key = item.languageFamily
        break
      case 'timezone':
        key = item.timezone
        break
      case 'currency':
        key = item.currency
        break
      default:
        key = item.country
    }
    
    groups[key] = (groups[key] || 0) + 1
  })
  
  return groups
} 