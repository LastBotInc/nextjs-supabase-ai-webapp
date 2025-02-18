import { Database } from '@/lib/database.types'

// Base types from database
export type AppointmentTypeBase = Database['public']['Tables']['appointment_types']['Row']
export type BookingSlotBase = Database['public']['Tables']['booking_slots']['Row']
export type BookingSettings = Database['public']['Tables']['booking_settings']['Row']

// Extended types with additional fields
export interface AppointmentType {
  id: string
  user_id: string
  name: string
  slug: string
  description?: string
  duration: number
  price: number | null
  is_free: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BookingSlot {
  id: string
  start_time: string
  end_time: string
  duration: number
  status: 'available' | 'booked' | 'cancelled'
  user_id: string
  booking?: Booking
  original_slots?: string[]
}

export interface AvailableSlot extends Omit<BookingSlot, 'id'> {
  slot_id: string
}

// Request types
export type CreateBookingRequest = {
  customer_name: string
  customer_email: string
  customer_company?: string
  description?: string
  start_time: string
  end_time: string
  user_id: string
  appointment_type_id: string
}

export interface CreateBookingSlotRequest {
  startTime: string
  endTime: string
  duration: number
  appointmentTypeId: string
}

export interface UpdateBookingSettingsRequest {
  timezone?: string
  default_duration?: number
  buffer_before?: number
  buffer_after?: number
  available_hours?: {
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6
    startTime: string
    endTime: string
  }[]
  unavailable_dates?: string[]
}

export interface CancelBookingRequest {
  reason?: string
}

export interface CreateAppointmentTypeRequest {
  name: string
  description?: string
  duration: number
  price?: number | null
  is_free?: boolean
}

export interface UpdateAppointmentTypeRequest extends Partial<CreateAppointmentTypeRequest> {
  is_active?: boolean
}

export interface Booking {
  id: string
  user_id: string
  customer_name: string
  customer_email: string
  customer_company?: string
  description?: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
} 