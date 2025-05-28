import { NextResponse } from 'next/server'
import { CreateBookingSlotRequest } from '@/lib/types/booking'
import { Database } from '@/lib/database.types'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('\n📅 [GET /api/booking/host/slots]', {
      startDate,
      endDate,
      headers: Object.fromEntries(request.headers)
    })

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ [GET /api/booking/host/slots] Missing or invalid auth header')
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
      console.error('❌ [GET /api/booking/host/slots] Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // After authentication, use service role client for database operations
    console.log('🔑 Creating service role client...')
    const supabase = await createClient(undefined, true)

    // Get user's slots
    console.log('📊 Fetching slots...')
    const { data: slots, error: slotsError } = await supabase
      .from('booking_slots')
      .select(`
        *,
        booking:bookings!booking_slots_booking_id_fkey(*)
      `)
      .eq('user_id', user.id)
      .gte('start_time', startDate)
      .lte('end_time', endDate)
      .order('start_time')

    if (slotsError) {
      console.error('❌ [GET /api/booking/host/slots] Database error:', slotsError)
      return NextResponse.json(
        { error: 'Failed to fetch slots' },
        { status: 500 }
      )
    }

    console.log('✅ Successfully fetched slots:', slots?.length || 0)
    return NextResponse.json(slots || [])
  } catch (error) {
    console.error('❌ [GET /api/booking/host/slots] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateBookingSlotRequest
    const { startTime, endTime, duration } = body

    if (!startTime || !endTime || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // Create the slot
    const { data: slot, error: slotError } = await supabase
      .from('booking_slots')
      .insert({
        start_time: startTime,
        end_time: endTime,
        duration,
        status: 'available',
        user_id: user.id
      })
      .select()
      .single()

    if (slotError) {
      console.error('Error creating slot:', slotError)
      return NextResponse.json(
        { error: 'Failed to create slot' },
        { status: 500 }
      )
    }

    return NextResponse.json(slot)
  } catch (error) {
    console.error('Error in POST /api/booking/host/slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('id')
    const body = await request.json()
    const { status } = body

    if (!slotId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // Update the slot
    const { data: slot, error } = await supabase
      .from('booking_slots')
      .update({ status })
      .eq('id', slotId)
      .select()
      .single()

    if (error) {
      console.error('Error updating slot:', error)
      return NextResponse.json(
        { error: 'Failed to update slot' },
        { status: 500 }
      )
    }

    return NextResponse.json(slot)
  } catch (error) {
    console.error('Error in PUT /api/booking/host/slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('id')

    if (!slotId) {
      return NextResponse.json(
        { error: 'Missing slot ID' },
        { status: 400 }
      )
    }

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

    // Delete the slot
    const { error } = await supabase
      .from('booking_slots')
      .delete()
      .eq('id', slotId)

    if (error) {
      console.error('Error deleting slot:', error)
      return NextResponse.json(
        { error: 'Failed to delete slot' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/booking/host/slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 