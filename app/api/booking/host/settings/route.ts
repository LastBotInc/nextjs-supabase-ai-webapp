import { NextResponse } from 'next/server'
import { UpdateBookingSettingsRequest } from '@/lib/types/booking'
import { Database } from '@/lib/database.types'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    console.log('\n⚙️ [GET /api/booking/host/settings]', {
      headers: Object.fromEntries(request.headers)
    })

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ [GET /api/booking/host/settings] Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create regular client to verify the token
    console.log('🔑 Creating auth client...')
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('❌ [GET /api/booking/host/settings] Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // After authentication, use service role client for database operations
    console.log('🔑 Creating service role client...')
    const supabase = await createClient(undefined, true)

    // Get user's settings
    console.log('📊 Fetching settings...')
    const { data: settings, error: settingsError } = await supabase
      .from('booking_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (settingsError) {
      console.error('❌ [GET /api/booking/host/settings] Database error:', settingsError)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // If no settings exist, return default settings
    if (!settings) {
      console.log('ℹ️ No settings found, returning defaults')
      return NextResponse.json({
        user_id: user.id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        default_duration: 30,
        buffer_before: 5,
        buffer_after: 5,
        available_hours: [
          { day: 1, startTime: '09:00', endTime: '17:00' },
          { day: 2, startTime: '09:00', endTime: '17:00' },
          { day: 3, startTime: '09:00', endTime: '17:00' },
          { day: 4, startTime: '09:00', endTime: '17:00' },
          { day: 5, startTime: '09:00', endTime: '17:00' }
        ],
        unavailable_dates: []
      })
    }

    console.log('✅ Successfully fetched settings')
    return NextResponse.json(settings)
  } catch (error) {
    console.error('❌ [GET /api/booking/host/settings] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as UpdateBookingSettingsRequest
    const {
      timezone,
      default_duration,
      buffer_before,
      buffer_after,
      available_hours,
      unavailable_dates
    } = body

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create regular client to verify the token
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // After authentication, use service role client for database operations
    const supabase = await createClient(undefined, true)

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('booking_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const updateData = {
      ...(timezone && { timezone }),
      ...(default_duration && { default_duration }),
      ...(buffer_before !== undefined && { buffer_before }),
      ...(buffer_after !== undefined && { buffer_after }),
      ...(available_hours && { available_hours }),
      ...(unavailable_dates && { unavailable_dates }),
    }

    let result
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('booking_settings')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Create new settings
      result = await supabase
        .from('booking_settings')
        .insert({
          user_id: user.id,
          timezone: timezone || 'UTC',
          default_duration: default_duration || 30,
          buffer_before: buffer_before || 0,
          buffer_after: buffer_after || 0,
          available_hours: available_hours || [
            { day: 1, startTime: '09:00', endTime: '17:00' },
            { day: 2, startTime: '09:00', endTime: '17:00' },
            { day: 3, startTime: '09:00', endTime: '17:00' },
            { day: 4, startTime: '09:00', endTime: '17:00' },
            { day: 5, startTime: '09:00', endTime: '17:00' }
          ],
          unavailable_dates: unavailable_dates || [],
        })
        .select()
        .single()
    }

    const { data: settings, error: settingsError } = result

    if (settingsError) {
      console.error('Error updating settings:', settingsError)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in PUT /api/booking/host/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 