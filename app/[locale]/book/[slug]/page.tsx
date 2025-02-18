'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { format, addMinutes, parseISO, isSameDay, startOfMonth, endOfMonth } from 'date-fns'
import { BookingSlot, CreateBookingRequest, AppointmentType, AvailableSlot } from '@/lib/types/booking'
import CalendarGrid from '@/components/booking/CalendarGrid'
import TimeSlotSelector from '@/components/booking/TimeSlotSelector'
import BookingForm from '@/components/booking/BookingForm'
import { createClient } from '@/utils/supabase/client'
import { useTranslations } from 'use-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBookingSchema } from '@/lib/validations/booking'

interface Props {
  params: Promise<{
    locale: string
    slug: string
  }>
}

// Helper function to check if slots can be combined for appointment
function findAvailableTimeSlots(
  slots: BookingSlot[],
  appointmentDuration: number,
  bufferTime: number = 15
): AvailableSlot[] {
  console.log('Finding available time slots with:', {
    totalSlots: slots.length,
    appointmentDuration,
    bufferTime
  })

  // Sort slots by start time
  const sortedSlots = [...slots].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  const availableTimeSlots: AvailableSlot[] = []
  
  // Combine consecutive 15-minute slots into 30-minute slots
  for (let i = 0; i < sortedSlots.length - 1; i++) {
    const currentSlot = sortedSlots[i]
    const nextSlot = sortedSlots[i + 1]
    
    // Check if current slot and next slot can be combined
    const currentStart = new Date(currentSlot.start_time)
    const currentEnd = new Date(currentSlot.end_time)
    const nextStart = new Date(nextSlot.start_time)
    const nextEnd = new Date(nextSlot.end_time)
    
    // If slots are consecutive and both available
    if (
      currentEnd.getTime() === nextStart.getTime() &&
      currentSlot.status === 'available' &&
      nextSlot.status === 'available'
    ) {
      // Create a combined 30-minute slot
      const combinedSlot: AvailableSlot = {
        slot_id: `${currentSlot.id}_${nextSlot.id}`,
        start_time: currentSlot.start_time,
        end_time: nextEnd.toISOString(),
        duration: 30,
        status: 'available',
        user_id: currentSlot.user_id,
        original_slots: [currentSlot.id, nextSlot.id]
      }
      availableTimeSlots.push(combinedSlot)
      // Skip the next slot since we used it
      i++
    }
  }

  console.log('Combined available slots:', {
    totalSlots: availableTimeSlots.length,
    firstSlot: availableTimeSlots[0],
    lastSlot: availableTimeSlots[availableTimeSlots.length - 1]
  })

  return availableTimeSlots
}

export default function BookingPage({ params }: Props) {
  // Unwrap params using React.use()
  const { locale, slug } = use(params)
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<Array<BookingSlot>>([])
  const [monthlySlots, setMonthlySlots] = useState<Array<BookingSlot>>([])
  const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
  const [error, setError] = useState<string | null>(null)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerCompany, setCustomerCompany] = useState('')
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  // Fetch appointment type by slug
  useEffect(() => {
    const fetchAppointmentType = async () => {
      const { data: appointmentTypeData, error } = await supabase
        .from('appointment_types')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error || !appointmentTypeData) {
        console.error('Error fetching appointment type:', error)
        return
      }

      setAppointmentType(appointmentTypeData)
    }

    fetchAppointmentType()
  }, [slug])

  // Fetch available slots for the entire month
  const fetchMonthlySlots = async (date: Date) => {
    if (!appointmentType) {
      console.log('No appointment type available, skipping slot fetch')
      return
    }

    setIsLoading(true)
    try {
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)

      console.log('Fetching slots for month:', {
        startDate: format(monthStart, 'yyyy-MM-dd'),
        endDate: format(monthEnd, 'yyyy-MM-dd'),
        timezone,
        appointmentType: {
          id: appointmentType.id,
          duration: appointmentType.duration,
          name: appointmentType.name
        }
      })

      const response = await fetch(
        `/api/booking/slots?${new URLSearchParams({
          startDate: format(monthStart, 'yyyy-MM-dd'),
          endDate: format(monthEnd, 'yyyy-MM-dd'),
          timezone,
          appointmentTypeId: appointmentType.id
        })}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch slots')
      }

      const slots = await response.json()
      console.log('Received slots from API:', {
        totalSlots: slots.length,
        firstSlot: slots[0],
        lastSlot: slots[slots.length - 1],
        monthStart: format(monthStart, 'yyyy-MM-dd'),
        monthEnd: format(monthEnd, 'yyyy-MM-dd')
      })

      setMonthlySlots(slots)
      
      // Filter slots for the selected date
      const selectedDateSlots = slots.filter(
        (slot: BookingSlot) => {
          const slotDate = format(new Date(slot.start_time), 'yyyy-MM-dd')
          const targetDate = format(selectedDate, 'yyyy-MM-dd')
          console.log('Comparing dates:', {
            slotDate,
            targetDate,
            matches: slotDate === targetDate
          })
          return slotDate === targetDate
        }
      )

      console.log('Filtered slots for selected date:', {
        selectedDate: format(selectedDate, 'yyyy-MM-dd'),
        totalFilteredSlots: selectedDateSlots.length,
        firstFilteredSlot: selectedDateSlots[0]
      })

      setAvailableSlots(selectedDateSlots)
    } catch (error) {
      console.error('Error fetching slots:', error)
      setError('Failed to fetch available slots')
    } finally {
      setIsLoading(false)
    }
  }

  // Update slots when date changes
  useEffect(() => {
    if (appointmentType) {
      fetchMonthlySlots(selectedDate)
    }
  }, [appointmentType, selectedDate])

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(new Date(date))
    // Filter slots for the selected date from monthly slots
    const selectedDateSlots = monthlySlots.filter(
      (slot: BookingSlot) => format(new Date(slot.start_time), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
    setAvailableSlots(selectedDateSlots)
    setSelectedSlot(null)
  }

  // Get available dates for the calendar
  const getAvailableDates = () => {
    const availableDates = new Set<string>()
    monthlySlots.forEach((slot: BookingSlot) => {
      availableDates.add(format(new Date(slot.start_time), 'yyyy-MM-dd'))
    })
    return Array.from(availableDates)
  }

  // Handle slot selection
  const handleSlotSelect = (slot: BookingSlot | AvailableSlot) => {
    // Convert to AvailableSlot if it's a BookingSlot
    const availableSlot: AvailableSlot = 'id' in slot ? {
      slot_id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      duration: slot.duration,
      status: slot.status,
      user_id: slot.user_id,
      original_slots: slot.original_slots
    } : slot

    setSelectedSlot(availableSlot)
  }

  // Handle booking submission
  const handleBookingSubmit = async (data: CreateBookingRequest) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = {
        ...data,
        start_time: selectedSlot?.start_time,
        end_time: selectedSlot?.end_time,
        user_id: appointmentType?.user_id,
        appointment_type_id: appointmentType?.id
      }

      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create booking')
      }

      const responseData = await response.json()
      setBookingConfirmed(true)
      setBookingData(responseData)
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!appointmentType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Appointment Type Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The appointment type you're looking for doesn't exist or is no longer active.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {appointmentType.name}
          </h1>
          {appointmentType.description && (
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              {appointmentType.description}
            </p>
          )}
        </div>

        {/* Appointment details card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6 text-lg">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="font-medium">Duration:</span>
              <span>{appointmentType.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="font-medium">Price:</span>
              <span>{appointmentType.is_free ? 'Free' : `$${appointmentType.price}`}</span>
            </div>
          </div>
        </div>

        {/* Booking section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left column: Calendar */}
            <div className="lg:col-span-7">
              <h2 className="text-2xl font-semibold mb-6">Select a Date</h2>
              <CalendarGrid
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                availableDates={getAvailableDates()}
              />
            </div>

            {/* Middle column: Time slots */}
            <div className="lg:col-span-5">
              <h2 className="text-2xl font-semibold mb-6">Select a Time</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading available times...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No available times on this date
                </div>
              ) : (
                <TimeSlotSelector
                  slots={availableSlots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                  timezone={timezone}
                  appointmentDuration={appointmentType.duration}
                />
              )}
            </div>
          </div>
        </div>

        {/* Booking form section - only show when slot is selected */}
        {selectedSlot && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Complete Booking</h2>
            <BookingForm
              slot={selectedSlot}
              timezone={timezone}
              onSubmit={handleBookingSubmit}
              isSubmitting={isSubmitting}
              appointmentType={appointmentType}
            />
          </div>
        )}
      </div>
    </div>
  )
} 