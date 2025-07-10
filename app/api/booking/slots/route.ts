import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  startOfDay,
  endOfDay,
  parseISO,
  addHours,
  subHours
} from 'date-fns'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const appointmentTypeId = searchParams.get('appointmentTypeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const timezone = searchParams.get('timezone')

    console.log('Fetching slots with params:', {
      appointmentTypeId,
      startDate,
      endDate,
      timezone
    })

    if (!appointmentTypeId || !startDate || !endDate || !timezone) {
      console.error('Missing required parameters:', {
        appointmentTypeId,
        startDate,
        endDate,
        timezone
      })
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create clients
    const supabase = await createClient()
    const adminClient = await createClient(undefined, true)

    // First, get the appointment type to verify it exists and is active
    console.log('Checking appointment type:', appointmentTypeId)
    const { data: appointmentType, error: appointmentError } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('id', appointmentTypeId)
      .eq('is_active', true)
      .single()

    if (appointmentError) {
      console.error('Error fetching appointment type:', appointmentError)
      return NextResponse.json(
        { error: 'Error fetching appointment type', details: appointmentError },
        { status: 500 }
      )
    }

    if (!appointmentType) {
      console.error('Appointment type not found or inactive:', appointmentTypeId)
      return NextResponse.json(
        { error: 'Appointment type not found or inactive' },
        { status: 404 }
      )
    }

    // Get the user's booking settings for business hours using service role client
    let { data: settings, error: settingsError } = await adminClient
      .from('booking_settings')
      .select('*')
      .eq('user_id', appointmentType.user_id)
      .single()

    // If no settings exist, create default settings using service role client
    if (settingsError?.code === 'PGRST116') {
      console.log('No settings found, creating default settings for user:', appointmentType.user_id)
      
      const defaultSettings = {
        user_id: appointmentType.user_id,
        timezone: timezone,
        default_duration: 30,
        buffer_before: 5,
        buffer_after: 5,
        available_hours: [
          {
            day: 1,
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            day: 2,
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            day: 3,
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            day: 4,
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            day: 5,
            startTime: '09:00',
            endTime: '17:00'
          }
        ],
        unavailable_dates: []
      }

      console.log('Creating default settings:', defaultSettings)

      const { data: newSettings, error: createError } = await adminClient
        .from('booking_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (createError) {
        console.error('Error creating default settings:', createError)
        return NextResponse.json(
          { error: 'Failed to create default settings', details: createError },
          { status: 500 }
        )
      }

      console.log('Successfully created default settings:', newSettings)
      settings = newSettings
    } else if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      return NextResponse.json(
        { error: 'Failed to fetch settings', details: settingsError },
        { status: 500 }
      )
    }

    // Convert local dates to UTC for database query
    const localStart = startOfDay(parseISO(startDate))
    const localEnd = endOfDay(parseISO(endDate))
    
    // Get business hours from settings
    const businessHours = settings.available_hours[0]
    const startHour = businessHours.startTime.split(':')[0]
    const endHour = businessHours.endTime.split(':')[0]

    console.log('Time range:', {
      localStart: localStart.toISOString(),
      localEnd: localEnd.toISOString(),
      businessHours: {
        start: businessHours.startTime,
        end: businessHours.endTime
      }
    })

    // Fetch available slots
    const { data: slots, error } = await adminClient
      .from('booking_slots')
      .select('*')
      .eq('user_id', appointmentType.user_id)
      .eq('status', 'available')
      .gte('start_time', localStart.toISOString())
      .lte('end_time', localEnd.toISOString())
      .order('start_time')

    if (error) {
      console.error('Error fetching slots:', error)
      return NextResponse.json(
        { error: 'Failed to fetch slots', details: error },
        { status: 500 }
      )
    }

    console.log('Database query results:', {
      totalSlots: slots?.length || 0,
      firstSlot: slots?.[0],
      lastSlot: slots?.[slots?.length - 1],
      queryParams: {
        userId: appointmentType.user_id,
        startDate: localStart.toISOString(),
        endDate: localEnd.toISOString()
      }
    })

    // Filter slots to ensure they're within business hours in local timezone
    const filteredSlots = slots?.filter(slot => {
      const slotLocalTime = toZonedTime(new Date(slot.start_time), timezone)
      const hour = slotLocalTime.getHours()
      const day = slotLocalTime.getDay()
      
      // Check if the day is a business day (1-5 for Mon-Fri)
      const isBusinessDay = day >= 1 && day <= 5
      
      // Check if the hour is within business hours
      const isBusinessHour = hour >= parseInt(startHour) && hour < parseInt(endHour)

      console.log('Filtering slot:', {
        slotTime: slotLocalTime.toISOString(),
        hour,
        day,
        isBusinessDay,
        isBusinessHour,
        included: isBusinessDay && isBusinessHour
      })

      return isBusinessDay && isBusinessHour
    })

    console.log('Filtered slots:', {
      total: slots?.length || 0,
      filtered: filteredSlots?.length || 0,
      firstSlot: filteredSlots?.[0]?.start_time,
      lastSlot: filteredSlots?.[filteredSlots.length - 1]?.start_time,
      timezone
    })

    return NextResponse.json(filteredSlots || [])
  } catch (error) {
    console.error('Unexpected error in slots API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 