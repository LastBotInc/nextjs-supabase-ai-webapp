'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookingSettings, UpdateBookingSettingsRequest } from '@/lib/types/booking'
import clsx from 'clsx'
import { useAuth } from '@/components/auth/AuthProvider'

const workingHoursSchema = z.object({
  day: z.number().min(1).max(7),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
})

const settingsSchema = z.object({
  timezone: z.string(),
  default_duration: z.number().min(1, 'Duration must be at least 1 minute'),
  buffer_before: z.number().min(0, 'Buffer time cannot be negative'),
  buffer_after: z.number().min(0, 'Buffer time cannot be negative'),
  available_hours: z.array(workingHoursSchema),
  unavailable_dates: z.array(z.string()).optional()
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function CalendarSettings() {
  const t = useTranslations('Admin.calendar.settings')
  const { session } = useAuth()
  const [settings, setSettings] = useState<BookingSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      default_duration: 30,
      buffer_before: 0,
      buffer_after: 0,
      available_hours: []
    }
  })

  const availableHours = watch('available_hours')

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
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

        // Sort available hours by day when setting form values
        const sortedHours = (data.available_hours || []).sort(
          (a: { day: number }, b: { day: number }) => a.day - b.day
        )
        
        // Set form values
        setValue('timezone', data.timezone)
        setValue('default_duration', data.default_duration)
        setValue('buffer_before', data.buffer_before)
        setValue('buffer_after', data.buffer_after)
        setValue('available_hours', sortedHours)
        setValue('unavailable_dates', data.unavailable_dates || [])
      } catch (error) {
        console.error('Error fetching settings:', error)
        setError('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [session?.access_token, setValue])

  // Handle form submission
  const onSubmit = async (data: SettingsFormData) => {
    if (!session?.access_token) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/booking/host/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating settings:', error)
      setError('Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Add working day
  const addWorkingDay = () => {
    const currentHours = watch('available_hours') || []
    setValue('available_hours', [
      ...currentHours,
      { day: 1, startTime: '09:00', endTime: '17:00' }
    ].sort((a: { day: number }, b: { day: number }) => a.day - b.day)) // Sort by day when adding
  }

  // Remove working day
  const removeWorkingDay = (index: number) => {
    const currentHours = watch('available_hours') || []
    setValue('available_hours', currentHours.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('loading')}</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium mb-1">
            {t('timezone')}
          </label>
          <select
            id="timezone"
            className={clsx(
              'w-full rounded-lg border p-2',
              errors.timezone
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            )}
            {...register('timezone')}
          >
            {Intl.supportedValuesOf('timeZone').map(tz => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          {errors.timezone && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
              {errors.timezone.message}
            </p>
          )}
        </div>

        {/* Default duration */}
        <div>
          <label htmlFor="default_duration" className="block text-sm font-medium mb-1">
            {t('defaultDuration')}
          </label>
          <input
            type="number"
            id="default_duration"
            min="1"
            className={clsx(
              'w-full rounded-lg border p-2',
              errors.default_duration
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            )}
            {...register('default_duration', { valueAsNumber: true })}
          />
          {errors.default_duration && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
              {errors.default_duration.message}
            </p>
          )}
        </div>

        {/* Buffer times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="buffer_before" className="block text-sm font-medium mb-1">
              {t('bufferBefore')}
            </label>
            <input
              type="number"
              id="buffer_before"
              min="0"
              className={clsx(
                'w-full rounded-lg border p-2',
                errors.buffer_before
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              {...register('buffer_before', { valueAsNumber: true })}
            />
            {errors.buffer_before && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.buffer_before.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="buffer_after" className="block text-sm font-medium mb-1">
              {t('bufferAfter')}
            </label>
            <input
              type="number"
              id="buffer_after"
              min="0"
              className={clsx(
                'w-full rounded-lg border p-2',
                errors.buffer_after
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              {...register('buffer_after', { valueAsNumber: true })}
            />
            {errors.buffer_after && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.buffer_after.message}
              </p>
            )}
          </div>
        </div>

        {/* Working hours */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{t('workingHours')}</h3>
            <button
              type="button"
              onClick={addWorkingDay}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('addWorkingDay')}
            </button>
          </div>

          {availableHours.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              {t('noWorkingDays')}
            </p>
          ) : (
            <div className="space-y-4">
              {availableHours.map((_, index) => (
                <div key={index} className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      {t('day')}
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2"
                      {...register(`available_hours.${index}.day` as const, {
                        valueAsNumber: true
                      })}
                    >
                      <option value={1}>{t('days.monday')}</option>
                      <option value={2}>{t('days.tuesday')}</option>
                      <option value={3}>{t('days.wednesday')}</option>
                      <option value={4}>{t('days.thursday')}</option>
                      <option value={5}>{t('days.friday')}</option>
                      <option value={6}>{t('days.saturday')}</option>
                      <option value={7}>{t('days.sunday')}</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      {t('startTime')}
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2"
                      {...register(`available_hours.${index}.startTime` as const)}
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      {t('endTime')}
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2"
                      {...register(`available_hours.${index}.endTime` as const)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeWorkingDay(index)}
                    className="text-red-600 dark:text-red-400 hover:underline mb-2"
                  >
                    {t('remove')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className={clsx(
            'w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors',
            isSaving
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-blue-700 active:bg-blue-800'
          )}
        >
          {isSaving ? t('saving') : t('save')}
        </button>
      </form>
    </div>
  )
} 