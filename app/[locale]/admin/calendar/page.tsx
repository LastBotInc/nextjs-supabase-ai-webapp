'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { 
  BookingSlot, 
  BookingSettings, 
  UpdateBookingSettingsRequest,
  AppointmentType
} from '@/lib/types/booking'
import SettingsPanel from '@/components/booking/SettingsPanel'
import CalendarGrid from '@/components/booking/CalendarGrid'
import TimeSlotSelector from '@/components/booking/TimeSlotSelector'
import SlotCreationForm from '@/components/booking/SlotCreationForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, addMonths, isSameDay } from 'date-fns'
import CalendarSettings from '@/components/admin/calendar/CalendarSettings'
import CalendarSlots from '@/components/admin/calendar/CalendarSlots'
import AppointmentTypes from '@/components/admin/calendar/AppointmentTypes'

// Define the slot creation type locally since it's different from the API type
interface SlotCreationFormData {
  startDate: string
  endDate: string
  duration: number
}

export default function AdminCalendarPage() {
  const t = useTranslations('Admin.calendar')
  const initialFetchDone = useRef(false)
  const [slots, setSlots] = useState<BookingSlot[]>([])
  const [settings, setSettings] = useState<BookingSettings | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(addMonths(new Date(), 1))
  })
  const { session, isAdmin, loading: authLoading } = useAuth()

  // Fetch slots for the entire date range
  const fetchSlots = useCallback(async (start: Date, end: Date) => {
    if (!session?.access_token) return

    try {
      console.log('Fetching slots for range:', {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      })
      
      const response = await fetch(`/api/booking/host/slots?${new URLSearchParams({
        startDate: startOfDay(start).toISOString(),
        endDate: endOfDay(end).toISOString()
      })}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch slots')
      }

      const data = await response.json()
      console.log('Fetched slots:', data.length)
      setSlots(data || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
    }
  }, [session?.access_token])

  // Fetch user's booking settings
  const fetchSettings = useCallback(async () => {
    if (!session?.access_token) return

    try {
      const response = await fetch('/api/booking/host/settings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }, [session?.access_token])

  // Single effect for initial data loading
  useEffect(() => {
    if (initialFetchDone.current || !session?.access_token || loading || authLoading) {
      return
    }

    const loadInitialData = async () => {
      setLoading(true)
      try {
        initialFetchDone.current = true
        await Promise.all([
          fetchSettings(),
          fetchSlots(dateRange.start, dateRange.end)
        ])
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [session?.access_token, loading, authLoading, fetchSettings, fetchSlots, dateRange])

  // Reset fetch flag when session changes
  useEffect(() => {
    if (!session?.access_token) {
      initialFetchDone.current = false
    }
  }, [session?.access_token])

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }, [])

  // Create new booking slots
  const handleCreateSlots = async (data: SlotCreationFormData) => {
    if (!session?.access_token) return
    
    setIsSaving(true)
    try {
      console.log('Creating slots with data:', data)
      
      // Convert dates to UTC midnight
      const startDate = new Date(data.startDate)
      startDate.setUTCHours(0, 0, 0, 0)
      
      const endDate = new Date(data.endDate)
      endDate.setUTCHours(23, 59, 59, 999)

      const requestData = {
        user_id: session.user.id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration_minutes: 30,
        status: 'available',
        schedule: {
          working_hours: {
            start: "09:00",
            end: "17:00"
          },
          working_days: [1, 2, 3, 4, 5] // Monday to Friday
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      console.log('Sending request with:', requestData)

      const response = await fetch('/api/booking/host/slots/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.message || 'Failed to generate slots')
      }

      // Refresh slots for the selected date range
      await fetchSlots(startDate, endDate)
    } catch (error) {
      console.error('Error generating slots:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate slots')
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // Update booking settings
  const handleUpdateSettings = async (data: UpdateBookingSettingsRequest) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/booking/host/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          timezone: data.timezone,
          default_duration: data.default_duration,
          buffer_before: data.buffer_before,
          buffer_after: data.buffer_after,
          available_hours: data.available_hours,
          unavailable_dates: data.unavailable_dates
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      // Fetch fresh settings after update
      await fetchSettings()
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error // Re-throw to let the form handle the error
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel a booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/booking/host/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      await fetchSlots(dateRange.start, dateRange.end)
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-sm text-gray-500">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">{t('description')}</p>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">{t('tabs.calendar')}</TabsTrigger>
          <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
          <TabsTrigger value="appointment-types">{t('tabs.appointmentTypes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <CalendarSlots 
            slots={slots}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onCreateSlots={handleCreateSlots}
            onCancelSlot={handleCancelBooking}
            isLoading={loading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="settings">
          <CalendarSettings />
        </TabsContent>

        <TabsContent value="appointment-types">
          <AppointmentTypes />
        </TabsContent>
      </Tabs>
    </div>
  )
} 