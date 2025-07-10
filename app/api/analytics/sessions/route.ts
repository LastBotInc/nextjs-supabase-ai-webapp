import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { AnalyticsSession } from '@/lib/analytics'

export async function POST(request: Request) {
  try {
    console.log('\n📊 [POST /api/analytics/sessions]')
    
    // Parse session data
    const session = await request.json() as AnalyticsSession
    
    // Create Supabase client
    const supabase = await createClient(undefined, true)

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('analytics_sessions')
      .select('id')
      .eq('id', session.id)
      .maybeSingle()

    if (existingSession) {
      console.log('📊 Session already exists:', session.id)
      return NextResponse.json({ success: true, existing: true })
    }

    // Insert new session with enhanced properties
    const { error } = await supabase
      .from('analytics_sessions')
      .insert({
        id: session.id,
        first_page: session.first_page,
        user_id: session.user_id,
        referrer: session.referrer,
        user_agent: session.user_agent,
        device_type: session.device_type,
        browser: session.browser,
        os: session.os,
        screen_resolution: session.screen_resolution,
        country: session.country,
        region: session.region,
        city: session.city,
        timezone: session.timezone,
        session_duration: session.session_duration || 0,
        page_views: session.page_views || 0,
        is_engaged: session.is_engaged || false,
        engagement_score: session.engagement_score || 0.0
      })

    if (error) {
      console.error('❌ Error inserting session:', error)
      return NextResponse.json(
        { error: 'Failed to insert session' },
        { status: 500 }
      )
    }

    console.log('✅ Enhanced session created successfully:', {
      id: session.id,
      first_page: session.first_page,
      device: session.device_type,
      browser: session.browser
    })

    return NextResponse.json({ success: true, new: true })
  } catch (error) {
    console.error('❌ Error in analytics sessions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 