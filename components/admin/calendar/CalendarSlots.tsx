'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookingSlot, CreateBookingSlotRequest } from '@/lib/types/booking'
import { format, parseISO, addDays, isSameDay } from 'date-fns'
import clsx from 'clsx'
import CalendarGrid from '@/components/booking/CalendarGrid'
import TimeSlotSelector from '@/components/booking/TimeSlotSelector'

const slotCreationSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes')
})

type SlotCreationFormData = z.infer<typeof slotCreationSchema>

interface CalendarSlotsProps {
  slots: BookingSlot[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onCreateSlots: (data: SlotCreationFormData) => Promise<void>
  onCancelSlot: (slotId: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function CalendarSlots({
  slots,
  selectedDate,
  onDateSelect,
  onCreateSlots,
  onCancelSlot,
  isLoading,
  error: externalError
}: CalendarSlotsProps) {
  const t = useTranslations('Admin.calendar.slots')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SlotCreationFormData>({
    resolver: zodResolver(slotCreationSchema),
    defaultValues: {
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      duration: 15 // Default duration of 15 minutes for basic slots
    }
  })

  // Handle slot creation
  const onSubmit = async (data: SlotCreationFormData) => {
    console.log('Submitting form data:', data)
    setIsCreating(true)
    setError(null)

    try {
      await onCreateSlots(data)
    } catch (error) {
      console.error('Error creating slots:', error)
      setError('Failed to create slots')
    } finally {
      setIsCreating(false)
    }
  }

  // Filter slots for selected date
  const selectedDateSlots = slots.filter(slot => 
    isSameDay(parseISO(slot.start_time), selectedDate)
  )

  // Separate slots by status
  const availableSlots = selectedDateSlots.filter(slot => slot.status === 'available')
  const bookedSlots = selectedDateSlots.filter(slot => slot.status === 'booked' && slot.booking)

  return (
    <div className="space-y-8">
      {/* Slot creation form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('createSlots')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                {t('startDate')}
              </label>
              <input
                type="date"
                id="startDate"
                defaultValue={format(new Date(), 'yyyy-MM-dd')}
                className={clsx(
                  'w-full rounded-lg border p-2',
                  errors.startDate
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                )}
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                {t('endDate')}
              </label>
              <input
                type="date"
                id="endDate"
                defaultValue={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                className={clsx(
                  'w-full rounded-lg border p-2',
                  errors.endDate
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                )}
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium mb-1">
              {t('slotDuration')}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id="duration"
                min="15"
                step="15"
                className={clsx(
                  'w-full rounded-lg border p-2',
                  errors.duration
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                )}
                {...register('duration', { valueAsNumber: true })}
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.duration.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Create 15-minute slots that can be combined for longer appointments
            </p>
          </div>

          {(error || externalError) && (
            <div className="text-red-500 dark:text-red-400 text-sm">
              {error || externalError}
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating}
            className={clsx(
              'w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors',
              isCreating
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-blue-700 active:bg-blue-800'
            )}
          >
            {isCreating ? t('creating') : t('create')}
          </button>
        </form>
      </div>

      {/* Calendar and slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('selectDate')}</h2>
          <CalendarGrid
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            availableDates={slots.map(slot =>
              format(parseISO(slot.start_time), 'yyyy-MM-dd')
            )}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t('slots')}</h2>
          {isLoading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : selectedDateSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('noSlots')}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Available Slots */}
              {availableSlots.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                    {t('availableSlots')} ({availableSlots.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {availableSlots.map(slot => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {format(parseISO(slot.start_time), 'h:mm a')} -
                            {format(parseISO(slot.end_time), 'h:mm a')}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {format(parseISO(slot.start_time), 'MMMM d, yyyy')}
                          </div>
                        </div>
                        <button
                          onClick={() => onCancelSlot(slot.id)}
                          className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booked Slots */}
              {bookedSlots.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                    {t('bookedSlots')} ({bookedSlots.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {bookedSlots.map(slot => (
                      <div
                        key={slot.id}
                        className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm border border-green-200 dark:border-green-800"
                      >
                        <div className="font-medium text-sm">
                          {format(parseISO(slot.start_time), 'h:mm a')} -
                          {format(parseISO(slot.end_time), 'h:mm a')}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {format(parseISO(slot.start_time), 'MMMM d, yyyy')}
                        </div>
                        {slot.booking && (
                          <div className="mt-2 border-t border-green-200 dark:border-green-800 pt-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {slot.booking.customer_name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {slot.booking.customer_email}
                            </div>
                            {slot.booking.customer_company && (
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {slot.booking.customer_company}
                              </div>
                            )}
                            {slot.booking.notes && (
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                                {slot.booking.notes}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => onCancelSlot(slot.id)}
                          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          {t('cancelBooking')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 