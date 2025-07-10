import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  addDays,
  addMinutes,
  differenceInDays,
  parse,
  parseISO,
} from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export async function POST(request: Request) {
  try {
    console.log('Starting slot generation...')
    const body = await request.json()
    console.log('Received request body:', body)

    // Validate required fields
    const requiredFields = ['user_id', 'start_time', 'end_time', 'duration_minutes', 'schedule']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: 'Missing required fields', missing: missingFields },
        { status: 400 }
      )
    }

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create regular client to verify the token
    console.log('Verifying user authentication...')
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized', details: authError },
        { status: 401 }
      )
    }
    console.log('User authenticated:', user.id)

    // After authentication, use service role client for database operations
    const supabase = await createClient(undefined, true)

    // Get user's booking settings
    console.log('Fetching user booking settings...')
    const { data: settings, error: settingsError } = await supabase
      .from('booking_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      return NextResponse.json(
        { error: 'Failed to fetch settings', details: settingsError },
        { status: 500 }
      )
    }

    if (!settings) {
      console.error('No settings found for user:', user.id)
      return NextResponse.json(
        { error: 'Please configure your booking settings before generating slots' },
        { status: 400 }
      )
    }

    const { timezone, buffer_before, buffer_after } = settings
    const { working_hours, working_days } = body.schedule

    if (!working_hours || !working_days) {
      console.error('Missing schedule configuration:', { working_hours, working_days })
      return NextResponse.json(
        { error: 'Invalid schedule configuration' },
        { status: 400 }
      )
    }

    console.log('Generating slots with configuration:', {
      timezone,
      duration: body.duration_minutes,
      buffer_before,
      buffer_after,
      working_hours,
      working_days,
      start_time: body.start_time,
      end_time: body.end_time
    })

    // Parse the date range
    const rangeStart = new Date(body.start_time)
    const rangeEnd = new Date(body.end_time)
    const dayCount = differenceInDays(rangeEnd, rangeStart) + 1

    console.log('Generating slots for date range:', {
      rangeStart,
      rangeEnd,
      dayCount
    })

    // Generate slots for the specified date range
    const slots = []

    for (let i = 0; i < dayCount; i++) {
      const currentDate = addDays(rangeStart, i)
      const dayOfWeek = currentDate.getDay()

      // Check if this day is a working day
      if (!working_days.includes(dayOfWeek)) {
        console.log(`Skipping non-working day: ${currentDate.toISOString()} (day ${dayOfWeek})`)
        continue
      }

      // Convert times to Date objects in user's timezone
      const startTime = parse(working_hours.start, 'HH:mm', currentDate)
      const endTime = parse(working_hours.end, 'HH:mm', currentDate)
      
      // Convert to user's timezone
      const zonedStartTime = toZonedTime(startTime, timezone)
      const zonedEndTime = toZonedTime(endTime, timezone)

      console.log(`Generating slots for day ${currentDate.toISOString()}:`, {
        zonedStartTime,
        zonedEndTime
      })

      // Generate slots for the day
      let currentSlotStart = zonedStartTime
      while (currentSlotStart < zonedEndTime) {
        const slotEnd = addMinutes(currentSlotStart, body.duration_minutes)
        if (slotEnd > zonedEndTime) break

        // Add buffer times
        const slotStartWithBuffer = addMinutes(currentSlotStart, buffer_before)
        const slotEndWithBuffer = addMinutes(slotEnd, buffer_after)

        // Check if the slot with buffers fits within available hours
        if (slotEndWithBuffer <= zonedEndTime) {
          slots.push({
            start_time: new Date(currentSlotStart).toISOString(),
            end_time: new Date(slotEnd).toISOString(),
            duration: 15, // Always create 15-minute base slots
            status: 'available',
            user_id: user.id
          })
        }

        // Move to next slot
        currentSlotStart = slotEnd
      }
    }

    console.log('Generated slots:', {
      totalCount: slots.length,
      firstSlot: slots[0],
      lastSlot: slots[slots.length - 1]
    })

    // Insert slots in batches to avoid hitting request size limits
    const batchSize = 100
    let insertedCount = 0

    for (let i = 0; i < slots.length; i += batchSize) {
      const batch = slots.slice(i, i + batchSize)
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(slots.length / batchSize)}...`)
      
      const { error: insertError } = await supabase
        .from('booking_slots')
        .insert(batch)

      if (insertError) {
        console.error('Error inserting slots:', insertError)
        return NextResponse.json(
          { error: 'Failed to create slots', details: insertError },
          { status: 500 }
        )
      }

      insertedCount += batch.length
      console.log(`Successfully inserted ${insertedCount}/${slots.length} slots`)
    }

    return NextResponse.json({ count: insertedCount })
  } catch (error) {
    console.error('Unexpected error in POST /api/booking/host/slots/generate:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 