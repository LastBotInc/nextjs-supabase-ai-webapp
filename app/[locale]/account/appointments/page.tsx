'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppointmentType, CreateAppointmentTypeRequest } from '@/lib/types/booking'
import clsx from 'clsx'

export const dynamic = 'force-dynamic'

const appointmentTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  is_free: z.boolean().default(false),
})

type AppointmentTypeFormData = z.infer<typeof appointmentTypeSchema>

export default function AppointmentsPage() {
  const t = useTranslations('Account.appointments')
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<AppointmentTypeFormData>({
    resolver: zodResolver(appointmentTypeSchema),
    defaultValues: {
      is_free: false,
    }
  })

  const isFree = watch('is_free')

  // Fetch appointment types
  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      try {
        const response = await fetch('/api/appointment-types')
        if (!response.ok) {
          throw new Error('Failed to fetch appointment types')
        }
        const data = await response.json()
        setAppointmentTypes(data)
      } catch (error) {
        console.error('Error fetching appointment types:', error)
        setError('Failed to load appointment types')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppointmentTypes()
  }, [])

  // Handle form submission
  const onSubmit = async (data: AppointmentTypeFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/appointment-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create appointment type')
      }

      const newAppointmentType = await response.json()
      setAppointmentTypes(prev => [newAppointmentType, ...prev])
      reset()
    } catch (error) {
      console.error('Error creating appointment type:', error)
      setError('Failed to create appointment type')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      {/* Create appointment type form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('createNew')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {t('form.name')}
            </label>
            <input
              type="text"
              id="name"
              className={clsx(
                'w-full rounded-lg border p-2',
                errors.name
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              {t('form.description')}
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2"
              {...register('description')}
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium mb-1">
              {t('form.duration')}
            </label>
            <input
              type="number"
              id="duration"
              min="1"
              className={clsx(
                'w-full rounded-lg border p-2',
                errors.duration
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              {...register('duration', { valueAsNumber: true })}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.duration.message}
              </p>
            )}
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="is_free"
              className="rounded border-gray-300 dark:border-gray-600"
              {...register('is_free')}
            />
            <label htmlFor="is_free" className="ml-2 text-sm font-medium">
              {t('form.isFree')}
            </label>
          </div>

          {!isFree && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                {t('form.price')}
              </label>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                className={clsx(
                  'w-full rounded-lg border p-2',
                  errors.price
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                )}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {errors.price.message}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

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
            {isSubmitting ? t('form.creating') : t('form.create')}
          </button>
        </form>
      </div>

      {/* List of appointment types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b border-gray-200 dark:border-gray-700">
          {t('existingTypes')}
        </h2>
        {isLoading ? (
          <div className="p-6 text-center">{t('loading')}</div>
        ) : appointmentTypes.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {t('noTypes')}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {appointmentTypes.map(type => (
              <div key={type.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{type.name}</h3>
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-sm',
                    type.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  )}>
                    {type.is_active ? t('status.active') : t('status.inactive')}
                  </span>
                </div>
                {type.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {type.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    {t('duration')}: {type.duration} {t('minutes')}
                  </div>
                  <div>
                    {type.is_free ? t('free') : `${t('price')}: $${type.price}`}
                  </div>
                </div>
                <div className="mt-4">
                  <a
                    href={`/book/${type.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    {t('viewBookingPage')} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 