'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { BookingSettings, UpdateBookingSettingsRequest } from '@/lib/types/booking'
import { Json } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

const settingsSchema = z.object({
  timezone: z.string(),
  default_duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  buffer_before: z.number().min(0, 'Buffer must be non-negative'),
  buffer_after: z.number().min(0, 'Buffer must be non-negative'),
  available_hours: z.array(z.object({
    day: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string()
  })),
  unavailable_dates: z.array(z.string())
})

type DayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface AvailableHour {
  day: DayNumber
  startTime: string
  endTime: string
}

interface SettingsPanelProps {
  settings: {
    timezone?: string
    default_duration?: number
    buffer_before?: number
    buffer_after?: number
    available_hours?: Json | null
    unavailable_dates?: Json | null
  } | null
  onUpdate: (data: BookingSettingsData) => Promise<void>
  isSaving: boolean
}

interface BookingSettingsData {
  timezone: string
  default_duration: number
  buffer_before: number
  buffer_after: number
  available_hours: AvailableHour[]
  unavailable_dates: string[]
}

const validateDay = (day: number): day is DayNumber => {
  return day >= 0 && day <= 6
}

export default function SettingsPanel({
  settings,
  onUpdate,
  isSaving
}: SettingsPanelProps) {
  const { session } = useAuth()
  const t = useTranslations('Admin')

  const defaultAvailableHours: AvailableHour[] = [
    { day: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { day: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { day: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
    { day: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { day: 5, startTime: '09:00', endTime: '17:00' }  // Friday
  ]

  // Reorder days to start from Monday
  const dayNames = [
    t('calendar.settings.days.monday'),
    t('calendar.settings.days.tuesday'),
    t('calendar.settings.days.wednesday'),
    t('calendar.settings.days.thursday'),
    t('calendar.settings.days.friday'),
    t('calendar.settings.days.saturday'),
    t('calendar.settings.days.sunday')
  ]

  // Convert Sunday-based day number (0-6) to Monday-based (1-7)
  const getMondayBasedDay = (day: number) => {
    return day === 0 ? 6 : day - 1
  }

  // Convert Monday-based day number (1-7) to Sunday-based (0-6)
  const getSundayBasedDay = (day: number) => {
    return day === 6 ? 0 : day + 1
  }

  const parseAvailableHours = (hours: Json | null): AvailableHour[] => {
    if (!hours || !Array.isArray(hours)) return defaultAvailableHours
    return hours
      .filter(hour => {
        if (typeof hour !== 'object' || !hour) return false
        const { day, startTime, endTime } = hour as any
        return (
          validateDay(day) &&
          typeof startTime === 'string' &&
          typeof endTime === 'string'
        )
      })
      .map(hour => {
        const { day, startTime, endTime } = hour as { day: number, startTime: string, endTime: string }
        return {
          day: getMondayBasedDay(day) as DayNumber,
          startTime,
          endTime
        }
      })
      .sort((a, b) => a.day - b.day)
  }

  const [availableHours, setAvailableHours] = useState<AvailableHour[]>(
    parseAvailableHours(settings?.available_hours ?? null)
  )

  // Reset form when settings change
  useEffect(() => {
    setAvailableHours(parseAvailableHours(settings?.available_hours ?? null))
  }, [settings])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const availableHours = parseAvailableHours(formData.get('available_hours') as string)
    const unavailableDates = formData.get('unavailable_dates') as string
    
    const data: BookingSettingsData = {
      timezone: formData.get('timezone') as string,
      default_duration: parseInt(formData.get('default_duration') as string),
      buffer_before: parseInt(formData.get('buffer_before') as string),
      buffer_after: parseInt(formData.get('buffer_after') as string),
      available_hours: availableHours.map(hour => ({
        ...hour,
        day: getSundayBasedDay(hour.day) as DayNumber
      })),
      unavailable_dates: unavailableDates.split(',')
    }

    try {
      await onUpdate(data)
      toast.success(t('calendar.settings.updateSuccess'))
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error(t('calendar.settings.updateError'))
    }
  }

  const handleRemoveDay = (dayToRemove: number) => {
    setAvailableHours(current => current.filter(hour => hour.day !== dayToRemove))
  }

  const handleAddDay = (dayToAdd: number) => {
    const currentHours = availableHours.some(h => h.day === dayToAdd)
    if (!currentHours) {
      setAvailableHours(current => [
        ...current,
        { day: dayToAdd as DayNumber, startTime: '09:00', endTime: '17:00' }
      ].sort((a, b) => a.day - b.day))
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Basic Settings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">{t('settings.title')}</h2>
        <div className="grid gap-6">
          {/* Timezone */}
          <div>
            <Label htmlFor="timezone">{t('settings.timezone')}</Label>
            <Select
              name="timezone"
              defaultValue={settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('settings.timezone')} />
              </SelectTrigger>
              <SelectContent>
                {Intl.supportedValuesOf('timeZone').map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Duration */}
          <div>
            <Label htmlFor="default_duration">
              {t('settings.defaultDuration')} (minutes)
            </Label>
            <Input
              type="number"
              id="default_duration"
              name="default_duration"
              min={15}
              defaultValue={settings?.default_duration || 30}
              className="max-w-[200px]"
            />
          </div>

          {/* Buffer Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buffer_before">
                {t('settings.bufferBefore')} (minutes)
              </Label>
              <Input
                type="number"
                id="buffer_before"
                name="buffer_before"
                min={0}
                defaultValue={settings?.buffer_before || 0}
                className="max-w-[200px]"
              />
            </div>
            <div>
              <Label htmlFor="buffer_after">
                {t('settings.bufferAfter')} (minutes)
              </Label>
              <Input
                type="number"
                id="buffer_after"
                name="buffer_after"
                min={0}
                defaultValue={settings?.buffer_after || 0}
                className="max-w-[200px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Hours Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('settings.availableHours')}</h2>
          <Select
            value=""
            onValueChange={(value) => handleAddDay(parseInt(value))}
            disabled={availableHours.length >= 7}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('settings.addWorkingDay')} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 7 }, (_, i) => i)
                .filter(day => !availableHours.some(hour => hour.day === day))
                .map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    {t(`days.${['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day]}`)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {availableHours.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('settings.noWorkingDays')}
          </div>
        ) : (
          <div className="space-y-4">
            {availableHours
              .sort((a, b) => a.day - b.day)
              .map((hours) => (
                <Card key={hours.day} className="relative group hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <h3 className="font-medium">
                      {t(`days.${['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][hours.day]}`)}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDay(hours.day)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      {t('settings.remove')}
                    </Button>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('settings.startTime')}</Label>
                      <Input
                        type="time"
                        name={`start_time_${hours.day}`}
                        defaultValue={hours.startTime}
                      />
                    </div>
                    <div>
                      <Label>{t('settings.endTime')}</Label>
                      <Input
                        type="time"
                        name={`end_time_${hours.day}`}
                        defaultValue={hours.endTime}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('settings.saving')}
            </>
          ) : (
            t('settings.save')
          )}
        </Button>
      </div>

      {/* Hidden inputs for form submission */}
      <input
        type="hidden"
        name="available_hours"
        value={JSON.stringify(availableHours)}
      />
      <input
        type="hidden"
        name="unavailable_dates"
        value={JSON.stringify(settings?.unavailable_dates || [])}
      />
    </form>
  )
} 