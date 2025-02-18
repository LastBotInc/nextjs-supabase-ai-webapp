'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { BookingSlot, CreateBookingRequest, AppointmentType } from '@/lib/types/booking'
import clsx from 'clsx'

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerCompany: z.string().optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingFormProps {
  slot: BookingSlot
  timezone: string
  appointmentType: AppointmentType
  onSubmit: (data: CreateBookingRequest) => Promise<void>
  isSubmitting: boolean
}

export default function BookingForm({
  slot,
  timezone,
  appointmentType,
  onSubmit,
  isSubmitting
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema)
  })

  const formatTimeInTimezone = (isoString: string) => {
    const utcDate = parseISO(isoString)
    const zonedDate = toZonedTime(utcDate, timezone)
    return format(zonedDate, 'h:mm a')
  }

  const onFormSubmit = async (data: BookingFormData) => {
    await onSubmit({
      ...data,
      start_time: slot.start_time,
      end_time: slot.end_time,
      user_id: appointmentType.user_id,
      appointment_type_id: appointmentType.id
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Appointment summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Booking Details</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <div>
            <span className="font-medium">Type:</span> {appointmentType.name}
          </div>
          <div>
            <span className="font-medium">Date:</span> {format(parseISO(slot.start_time), 'MMMM d, yyyy')}
          </div>
          <div>
            <span className="font-medium">Time:</span> {formatTimeInTimezone(slot.start_time)} - {formatTimeInTimezone(slot.end_time)}
          </div>
          <div>
            <span className="font-medium">Duration:</span> {appointmentType.duration} minutes
          </div>
          <div>
            <span className="font-medium">Price:</span> {appointmentType.is_free ? 'Free' : `$${appointmentType.price}`}
          </div>
          <div>
            <span className="font-medium">Timezone:</span> {timezone}
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="customerName"
            className={clsx(
              'w-full rounded-lg border p-2',
              errors.customerName
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            )}
            {...register('customerName')}
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">
            Your Email
          </label>
          <input
            type="email"
            id="customerEmail"
            className={clsx(
              'w-full rounded-lg border p-2',
              errors.customerEmail
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            )}
            {...register('customerEmail')}
          />
          {errors.customerEmail && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
              {errors.customerEmail.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="customerCompany" className="block text-sm font-medium mb-1">
            Company (Optional)
          </label>
          <input
            type="text"
            id="customerCompany"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2"
            {...register('customerCompany')}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            id="description"
            rows={4}
            className={clsx(
              'w-full rounded-lg border p-2',
              errors.description
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            )}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={clsx(
          'w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors',
          isSubmitting
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-blue-700 active:bg-blue-800'
        )}
      >
        {isSubmitting ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  )
} 