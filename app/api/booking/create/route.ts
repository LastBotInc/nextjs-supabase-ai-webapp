import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { CreateBookingRequest } from '@/lib/types/booking'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Starting booking creation...')
    
    // Log request headers for debugging auth issues
    console.log('Request headers:', {
      auth: request.headers.get('Authorization')?.slice(0, 20) + '...',
      contentType: request.headers.get('Content-Type')
    })

    const rawData = await request.json()
    console.log('Raw request data:', {
      ...rawData,
      customerEmail: rawData.customerEmail ? '***@***.***' : undefined // Mask email for privacy
    })

    // Convert camelCase to snake_case
    const requestData = {
      customer_name: rawData.customerName,
      customer_email: rawData.customerEmail,
      customer_company: rawData.customerCompany,
      notes: rawData.description, // Map description to notes
      appointment_type_id: rawData.appointment_type_id,
      start_time: rawData.start_time,
      end_time: rawData.end_time,
      user_id: rawData.user_id
    }

    console.log('Converted request data:', {
      ...requestData,
      customer_email: '***@***.***' // Mask email for privacy
    })

    const { 
      customer_name,
      customer_email,
      customer_company,
      notes,
      appointment_type_id,
      start_time,
      end_time,
      user_id
    } = requestData

    // Validate required fields
    if (!customer_name || !customer_email || !start_time || !end_time || !user_id || !appointment_type_id) {
      console.error('❌ Missing required fields:', {
        hasCustomerName: !!customer_name,
        hasCustomerEmail: !!customer_email,
        hasStartTime: !!start_time,
        hasEndTime: !!end_time,
        hasUserId: !!user_id,
        hasAppointmentTypeId: !!appointment_type_id
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('✅ Required fields validated')
    console.log('🔑 Creating Supabase client...')
    const supabase = await createClient(undefined, true)

    // Get the appointment type to determine duration
    const { data: appointmentType, error: appointmentTypeError } = await supabase
      .from('appointment_types')
      .select('duration')
      .eq('id', appointment_type_id)
      .single()

    if (appointmentTypeError || !appointmentType) {
      console.error('❌ Error fetching appointment type:', {
        error: appointmentTypeError,
        code: appointmentTypeError?.code,
        details: appointmentTypeError?.details
      })
      return NextResponse.json(
        { error: 'Failed to fetch appointment type', details: appointmentTypeError?.message },
        { status: 500 }
      )
    }

    // Check if we have enough consecutive available slots
    const { data: availableSlots, error: slotsError } = await supabase
      .from('booking_slots')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'available')
      .gte('start_time', start_time)
      .lte('end_time', end_time)
      .order('start_time')

    if (slotsError) {
      console.error('❌ Error checking slot availability:', {
        error: slotsError,
        code: slotsError.code,
        details: slotsError.details
      })
      return NextResponse.json(
        { error: 'Error checking slot availability', details: slotsError.message },
        { status: 500 }
      )
    }

    // Calculate required number of 15-minute slots
    const requiredSlots = Math.ceil(appointmentType.duration / 15)
    
    if (!availableSlots || availableSlots.length < requiredSlots) {
      console.error('❌ Not enough consecutive slots available:', {
        required: requiredSlots,
        available: availableSlots?.length || 0
      })
      return NextResponse.json(
        { error: 'Not enough consecutive slots available for the requested duration' },
        { status: 400 }
      )
    }

    // Verify slots are actually consecutive
    for (let i = 1; i < availableSlots.length; i++) {
      const currentSlot = availableSlots[i]
      const previousSlot = availableSlots[i - 1]
      
      if (new Date(currentSlot.start_time).getTime() !== new Date(previousSlot.end_time).getTime()) {
        console.error('❌ Slots are not consecutive:', {
          current: currentSlot.start_time,
          previous: previousSlot.end_time
        })
        return NextResponse.json(
          { error: 'Required slots are not consecutive' },
          { status: 400 }
        )
      }
    }

    // Fetch user email separately
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user_id)
      .single()

    if (userError) {
      console.error('❌ Error fetching user:', {
        error: userError,
        code: userError.code,
        details: userError.details
      })
      return NextResponse.json(
        { error: 'Failed to fetch host information', details: userError.message },
        { status: 500 }
      )
    }

    // Create booking
    console.log('📝 Creating booking record...')
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        user_id,
        start_time,
        end_time,
        customer_name,
        customer_email,
        customer_company,
        description: notes,
        status: 'confirmed',
        appointment_type_id
      }])
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Error creating booking:', {
        error: bookingError,
        code: bookingError.code,
        details: bookingError.details
      })
      return NextResponse.json(
        { error: 'Failed to create booking', details: bookingError.message },
        { status: 500 }
      )
    }

    console.log('✅ Booking created:', { booking_id: bookingData.id })

    // Update all slots within the booking time range
    console.log('📝 Updating slot statuses...')
    const { error: updateError } = await supabase
      .from('booking_slots')
      .update({ status: 'booked', booking_id: bookingData.id })
      .eq('user_id', user_id)
      .gte('start_time', start_time)
      .lte('end_time', end_time)
      .eq('status', 'available')

    if (updateError) {
      console.error('❌ Error updating slots:', {
        error: updateError,
        code: updateError.code,
        details: updateError.details
      })
      return NextResponse.json(
        { error: 'Failed to update slots', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Slot status updated')

    // Send confirmation emails
    console.log('📧 Sending confirmation emails...')
    try {
      // Send to customer
      console.log('Sending customer confirmation email...')
      await sendEmail({
        to: customer_email,
        subject: 'Booking Confirmation',
        template: 'booking-confirmation',
        data: {
          customerName: customer_name,
          startTime: start_time,
          endTime: end_time,
          duration: appointmentType.duration,
          description: notes
        }
      })

      // Send to host
      console.log('Sending host notification email...')
      await sendEmail({
        to: userData.email,
        subject: 'New Booking Notification',
        template: 'booking-notification',
        data: {
          customerName: customer_name,
          customerEmail: customer_email,
          customerCompany: customer_company,
          startTime: start_time,
          endTime: end_time,
          description: notes
        }
      })
      console.log('✅ Confirmation emails sent')
    } catch (emailError) {
      console.error('⚠️ Error sending emails:', {
        error: emailError,
        message: emailError instanceof Error ? emailError.message : 'Unknown error'
      })
      // Don't fail the request if email sending fails
    }

    console.log('✅ Booking process completed successfully')
    return NextResponse.json(bookingData)
  } catch (error) {
    console.error('❌ Unexpected error in create booking API:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 