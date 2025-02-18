import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { AnalyticsSession } from '@/lib/analytics'

export async function POST(request: Request) {
  try {
    console.log('\n📊 [POST /api/analytics/sessions]')
    
    // Parse session data
    const session = await request.json() as AnalyticsSession
    
    // Create Supabase client
    const supabase = await createClient(true)

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('analytics_sessions')
      .select('id')
      .eq('id', session.id)
      .maybeSingle()

    if (existingSession) {
      return NextResponse.json({ success: true, existing: true })
    }

    // Insert new session
    const { error } = await supabase
      .from('analytics_sessions')
      .insert({
        id: session.id,
        first_page: session.first_page,
        user_id: session.user_id,
        referrer: session.referrer,
        user_agent: session.user_agent,
        device_type: session.device_type,
        country: session.country,
        city: session.city
      })

    if (error) {
      console.error('❌ Error inserting session:', error)
      return NextResponse.json(
        { error: 'Failed to insert session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, new: true })
  } catch (error) {
    console.error('❌ Error in analytics sessions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 