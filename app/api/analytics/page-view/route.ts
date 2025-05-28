import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    // Log request for debugging
    console.log('📊 [POST /api/analytics/page-view]')

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    let userId: string | null = null

    // Create Supabase client
    const supabase = await createClient(undefined, true)

    // If auth header exists, verify the user
    if (authHeader?.startsWith('Bearer ')) {
      const authClient = await createClient()
      const { data: { user }, error: authError } = await authClient.auth.getUser(
        authHeader.split(' ')[1]
      )
      
      if (!authError && user) {
        userId = user.id
      }
    }

    // Parse request body
    const {
      path,
      search,
      referrer,
      user_agent,
      screen_resolution,
      language
    } = await request.json()

    // Insert page view
    const { error: insertError } = await supabase
      .from('analytics_page_views')
      .insert({
        path,
        search_params: search,
        referrer,
        user_agent,
        screen_resolution,
        language,
        user_id: userId,
        timestamp: new Date().toISOString()
      })

    if (insertError) {
      console.error('❌ Error inserting page view:', insertError)
      throw insertError
    }

    console.log('✅ Page view tracked successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error tracking page view:', error)
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    )
  }
} 