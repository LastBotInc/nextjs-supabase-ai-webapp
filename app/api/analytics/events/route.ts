import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { AnalyticsEvent } from '@/lib/analytics'

// Batch size for inserting events
const BATCH_SIZE = 100

export async function POST(request: Request) {
  try {
    console.log('\n📊 [POST /api/analytics/events]')
    
    // Parse event data
    const event = await request.json() as AnalyticsEvent
    
    // Create Supabase client
    const supabase = await createClient(true)

    // Insert event with batching
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: event.event_type,
        page_url: event.page_url,
        session_id: event.session_id,
        locale: event.locale,
        user_id: event.user_id,
        referrer: event.referrer,
        user_agent: event.user_agent,
        device_type: event.device_type,
        country: event.country,
        city: event.city,
        metadata: event.metadata
      })

    if (error) {
      console.error('❌ Error inserting event:', error)
      return NextResponse.json(
        { error: 'Failed to insert event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error in analytics events API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 