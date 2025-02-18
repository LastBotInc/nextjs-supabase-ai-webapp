import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { CancelBookingRequest } from '@/lib/types/booking'
import { Database } from '@/lib/database.types'
import { sendEmail } from '@/lib/email'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Build query
    let query = supabase
      .from('bookings')
      .select('*, slot:booking_slots!inner(*)')
      .eq('booking_slots.user_id', user.id)

    if (status) {
      query = query.eq('status', status)
    }
    if (startDate) {
      query = query.gte('booking_slots.start_time', startDate)
    }
    if (endDate) {
      query = query.lte('booking_slots.end_time', endDate)
    }

    const { data: bookings, error: bookingsError } = await query
      .order('booking_slots.start_time', { ascending: true })

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json(bookings || [])
  } catch (error) {
    console.error('Error in GET /api/booking/host/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    const body = await request.json() as CancelBookingRequest
    const { reason } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing booking ID' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get the booking with slot and user info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, slot:booking_slots!inner(*, user:auth.users!inner(email))')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) {
      console.error('Error cancelling booking:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      )
    }

    // Send cancellation emails
    try {
      // Send to customer
      await sendEmail({
        to: booking.customer_email,
        subject: 'Booking Cancelled',
        template: 'booking-cancellation',
        data: {
          customerName: booking.customer_name,
          startTime: booking.slot.start_time,
          endTime: booking.slot.end_time,
          hostEmail: booking.slot.user.email,
          reason
        }
      })

      // Send to host
      await sendEmail({
        to: booking.slot.user.email,
        subject: 'Booking Cancelled',
        template: 'booking-cancellation-host',
        data: {
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          startTime: booking.slot.start_time,
          endTime: booking.slot.end_time,
          reason
        }
      })
    } catch (emailError) {
      console.error('Error sending cancellation emails:', emailError)
      // Don't fail the request if emails fail
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error in PUT /api/booking/host/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 