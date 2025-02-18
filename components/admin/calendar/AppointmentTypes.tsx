'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppointmentType } from '@/lib/types/booking'
import clsx from 'clsx'
import { useAuth } from '@/components/auth/AuthProvider'

const appointmentTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  is_free: z.boolean().default(false),
  is_active: z.boolean().default(true),
  price: z.union([
    z.number().min(0, 'Price must be non-negative'),
    z.null()
  ]).optional().transform(val => val === null || val === undefined || val === 0 ? null : val)
}).refine(
  (data) => {
    if (data.is_free) {
      return true // Skip price validation for free appointments
    }
    return data.price !== null && data.price !== undefined && !isNaN(data.price)
  },
  {
    message: 'Price is required when appointment is not free',
    path: ['price']
  }
)

type AppointmentTypeFormData = z.infer<typeof appointmentTypeSchema>

const FORM_STORAGE_KEY = 'appointment-type-form-state'

export default function AppointmentTypes() {
  const t = useTranslations('Admin.calendar.appointmentTypes')
  const { session } = useAuth()
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AppointmentTypeFormData>({
    resolver: zodResolver(appointmentTypeSchema),
    defaultValues: {
      duration: 30,
      price: 0,
      is_free: false,
      is_active: true
    }
  })

  const isFree = watch('is_free')

  // Handle free/paid toggle
  useEffect(() => {
    if (isFree) {
      setValue('price', null)
    }
  }, [isFree, setValue])

  // Fetch appointment types
  const fetchAppointmentTypes = useCallback(async () => {
    if (!session?.access_token) return
    
    try {
      console.log('Fetching appointment types...')
      const response = await fetch('/api/appointment-types', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        })
        throw new Error(`Failed to fetch appointment types: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Fetched appointment types:', data)
      setAppointmentTypes(data)
    } catch (error) {
      console.error('Error fetching appointment types:', error)
      setError(error instanceof Error ? error.message : 'Failed to load appointment types')
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => {
    fetchAppointmentTypes()
  }, [fetchAppointmentTypes])

  // Handle form submission
  const onSubmit = async (data: AppointmentTypeFormData) => {
    if (!session?.access_token) return

    try {
      setError(null)
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId 
        ? `/api/appointment-types/${editingId}`
        : '/api/appointment-types'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to save appointment type: ${response.status} ${response.statusText}`)
      }

      await fetchAppointmentTypes()
      reset()
      setEditingId(null)
    } catch (error) {
      console.error('Error saving appointment type:', error)
      setError(error instanceof Error ? error.message : 'Failed to save appointment type')
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!session?.access_token || !confirm(t('deleteConfirm'))) return

    try {
      const response = await fetch(`/api/appointment-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete appointment type')
      }

      await fetchAppointmentTypes()
    } catch (error) {
      console.error('Error deleting appointment type:', error)
      setError('Failed to delete appointment type')
    }
  }

  // Handle edit
  const handleEdit = (type: AppointmentType) => {
    setEditingId(type.id)
    reset({
      name: type.name,
      slug: type.slug,
      description: type.description || undefined,
      duration: type.duration || 30,
      price: type.price || 0,
      is_free: type.is_free,
      is_active: type.is_active
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? t('editType') : t('createNew')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('form.name')}
            </label>
            <input
              type="text"
              className={clsx(
                'w-full rounded-lg border p-2',
                errors.name
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('form.slug')}
            </label>
            <input
              type="text"
              className={clsx(
                'w-full rounded-lg border p-2',
                errors.slug
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              {...register('slug')}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('form.description')}
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2"
              rows={3}
              {...register('description')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('form.duration')}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
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
              <span className="text-sm text-gray-500">{t('minutes')}</span>
            </div>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                {...register('is_free')}
              />
              <span className="text-sm">{t('form.isFree')}</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                {...register('is_active')}
              />
              <span className="text-sm">{t('form.isActive')}</span>
            </label>
          </div>

          {!isFree && (
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('form.price')}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={clsx(
                  'w-full rounded-lg border p-2',
                  errors.price
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                )}
                {...register('price', { 
                  valueAsNumber: true,
                  setValueAs: v => v === '' ? null : parseFloat(v)
                })}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                'px-4 py-2 rounded-lg bg-blue-600 text-white transition-colors',
                isSubmitting
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-blue-700 active:bg-blue-800'
              )}
            >
              {isSubmitting ? t('form.creating') : editingId ? t('form.update') : t('form.create')}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  reset()
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {t('form.cancel')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {appointmentTypes.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {t('noTypes')}
            </div>
          ) : (
            appointmentTypes.map((type) => (
              <div
                key={type.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium">{type.name}</h3>
                    <span
                      className={clsx(
                        'px-2 py-1 text-xs rounded-full',
                        type.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      )}
                    >
                      {type.is_active ? t('status.active') : t('status.inactive')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{type.duration} {t('minutes')}</span>
                    <span>•</span>
                    <span>
                      {type.is_free ? t('free') : `${type.price} €`}
                    </span>
                    <span>•</span>
                    <a
                      href={`/book/${type.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {t('viewBookingPage')}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(type)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    {t('form.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(type.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-100"
                  >
                    {t('form.delete')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 